import numpy as np

out_r = 600

print('<svg viewBox="{} {} {} {}" style="width: 400px; height: 400px">'.format(
    -out_r, -out_r, out_r * 2, out_r * 2
))

for i in range(48):
    theta1 = 90 + 30 * (i//4)
    theta2 = 90 + 30 * (i//4 + 1)
    rad1 = (i % 4 + 2) * 100
    rad2 = (i % 4 + 3) * 100
    print('  <path d="M {x1:.2f},{y1:.2f} L {x2:.2f},{y2:.2f} A {r2} {r2} {th1} 0 0 {x3:.2f},{y3:.2f} L {x4:.2f},{y4:.2f} A {r1} {r1} {th2} 0 1 {x1:.2f},{y1:.2f} z" stroke="gray" id="t{id}"/>'.format(
        x1=rad1 * np.cos(theta1 * np.pi / 180),
        y1=-rad1 * np.sin(theta1 * np.pi / 180),
        x2=rad2 * np.cos(theta1 * np.pi / 180),
        y2=-rad2 * np.sin(theta1 * np.pi / 180),
        x3=rad2 * np.cos(theta2 * np.pi / 180),
        y3=-rad2 * np.sin(theta2 * np.pi / 180),
        x4=rad1 * np.cos(theta2 * np.pi / 180),
        y4=-rad1 * np.sin(theta2 * np.pi / 180),
        r1=rad1,
        r2=rad2,
        th1=theta1,
        th2=theta2,
        id=i
    ))
print('</svg>')

