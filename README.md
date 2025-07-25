# snenk 🐍
smol snake game

## how to play

snakes love eating red apples. they don't like collisions.

## controls

### keyboard
- **arrow keys / wasd**: movement (automatically queued)
- **space**: step forward one tile
- **enter**: pause/unpause (or restart when dead)
- **backspace**: remove last queued direction
- **shift**: boosts movement, stepping and dequeuing for quadruple effect
- **ctrl + space**: step through entire queue
- **ctrl + backspace**: clear entire queue
- **ctrl + enter**: restart game

### mouse/touch
- **click/tap**: move towards cursor (along longer axis)
- **middle click**: move towards cursor (along shorter axis)
- **double click**: pause/unpause

### gamepad (assuming an XBox controller)
- **d-pad**: queue directions
- **left stick**: queue directions (discretized to 12 directions)
- **right stick**: move cursor around
- **A button**: step forward
- **B button**: remove last queued direction
- **right bumper**: move towards cursor (major axis)
- **right trigger**: move towards cursor (minor axis)
- **start**: pause/unpause
- **left trigger**: boost actions (like **shift** but analog)
- **left bumper**: modifier like **ctrl**
- **LB + A**: step through entire queue
- **LB + B**: clear entire queue
- **LB + start**: restart game

the game shows your queued moves as translucent green tiles, so you can plan ahead. gamepad cursor appears as a translucent orange tile.

have fun! 🐍