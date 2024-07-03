# 2.5d

Jeu avec simulation de 3d utilisant la techique de raycasting.

## Table des Matières

-   [Raycasting](#raycasting)
    -   [Principe](#principe)
    -   [Recherche d'intersection](#recherche-dintersections)
    -   [Taille des segments](#taille-des-segments)
    -   [Texture des Murs](#texture-des-murs)
-   [Sprites](#sprites)
    -   Animations

## Raycasting

> [!WARNING]
> Cette partie se base sur les informations d'un [article de permadi.com](https://www.permadi.com/tutorial/raycast/rayc7.html).

### Principe

Le raycasting est une technique visant à rendre un espace en 3 dimensions sur un plan en 2 dimensions en mesurant la distance entre l'observateur de la scène et les murs.

![render-segment](./render-segment.png)

Pour ce faire, on tire des rayons (1 rayon par colonne de pixels), et on affiche à l'écran un segment dont la taille dépend de la distance jusqu'au mur.

![ray](./ray.png)

![collide](./collide.png)

### Recherche d'intersections

Le joueur $P$ est placé aux coordonnées $(Px,Py)$ sur un plan représenté par un tableau à 2 dimensions. Chaque case est de dimension 64x64.

```javascript
const mapLayout = [
	[1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
	[1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
	[1, 0, 0, 1, 1, 1, 1, 1, 0, 1],
	[1, 0, 0, 0, 0, 0, 0, 1, 0, 1],
	[1, 0, 0, 0, 1, 0, 0, 1, 0, 1],
	[1, 0, 0, 0, 1, 0, 0, 0, 0, 1],
	[1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
	[1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
];
// 0 pour du vide, 1 pour un mur
```

La direction dans laquelle il regarde forme l'angle $\alpha$ avec l'axe horizontal $X$.

On tire un ensemble de rayons en cône depuis $𝑃$ dans son champ de vision.  
L'objectif est de trouver le point d'intersection entre chaque droite d'origine $𝑃$ et le mur le plus proche. Cette intersection peut se faire à la limite de chaque case, horizontalement ou verticalement.

---

Pour une intersection horizontale, on cherche $Xa = 64 \div \tan(\alpha)$, la distance qui sépare chaque intersection horizontale l'une de l'autre.

Soit $A(Ax,Ay)$, la première intersection horizontale :

|       |                                    |                               |
| ----- | ---------------------------------- | ----------------------------- |
| $Ay:$ | $\lceil Py\div64 \rceil\times64$   | si $(0 \leq \alpha \leq \pi)$ |
|       | $\lfloor Py\div64 \rfloor\times64$ | sinon                         |

$Ax = Px (Ay-Py)\div\tan(\alpha)$ |

Les intersections suivantes sont définies par :

-   $x_i = Ax+(Xa\times i)$
-   $y_i = Ay+(64\times i)$

[fig15]()

Même procédé pour la verticale : $Ya = 64 \times \tan(\alpha)$

Soit $B(Bx,By)$, la première intersection verticale:

|       |                                    |                                                                       |
| ----- | ---------------------------------- | --------------------------------------------------------------------- |
| $Bx:$ | $\lceil Px\div64 \rceil\times64$   | si $\Large(\frac{\pi}{2}$ $ \leq \alpha \leq$ $\Large\frac{3\pi}{2})$ |
|       | $\lfloor Px\div64 \rfloor\times64$ | sinon                                                                 |

$By = Py + (Bx-Px)\times\tan(\alpha)$ |

Les intersections suivantes sont définies par :

-   $x_i = Bx+(64\times i)$
-   $y_i = By+(Ya\times i)$

[fig16]

Reste à trouver un mur en parcourant un à un les points d'intersection pour enfin obtenir une distance et tracer le segment correspondant.

---

### Taille des segments

Pour calculer la taille du segment, on peut diviser la hauteur du mur (ici 64 pour coller aux dimensions des cases) par la distance.

**Taille du segment** = $64 \div distance$

Problème, si on utilise simplement la distance entre l'intersection $I$ et le joueur $P$, on obtient le résultat suivant :

![fisheye](./fisheye.png)

#### Correction des distances

Cette déformation est due au fait que les rayons sont tirés en arc de cercle.  
Sur l'image ci-dessous, la distance $Pi$ est plus importante que la distance $Pj$. Pourtant, puisqu'ils sont sur le même plan, ces points devraient être considérés à la même distance.

![correction-distance-1](./correction-distance-1.png)

On cherche alors à "corriger" la distance par rapport à un plan. Dans notre cas, la distance $Pi$ doit être égale à $Pj$, donc **distance corrigée** = $Pj$.

On défini $\theta$, l'angle formé par $\widehat{iPj}$ pour se placer dans le référentiel du champ de vision :  
$\cos(\theta)=$ **distance corrigée** $\div$ **distance**  
**distance corrigée** $=$ **distance** $\times \cos(\theta)$

![correction-distance-2](./correction-distance-2.png)

Ainsi, **Taille du segment** = $64 ÷ ($ **distance** $\times \cos(\theta))$

![render-animation](./render-animation.gif)

### Texture des Murs

## Sprites
