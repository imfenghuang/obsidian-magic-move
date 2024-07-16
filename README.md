<h1 align="center">Obisdian Magic Move</h1>

Obsidian Magic Move is a Obsidian (https://obsidian.md) plugin for animating code blocks. It based on [shiki-magic-move](https://github.com/shikijs/shiki-magic-move).

![OMM Gif](https://github.com/user-attachments/assets/7ceb9c02-2fd5-43a7-b05d-2ec3209510ff)

## Usage

- working in `Reading Mode`
- use **\`\`\`\`magic-move** to wrap multiple code blocks
- code block syntax is the same as you know
- supprt code highlighting

<pre>
````magic-move
```vue
import { defineComponent } from 'vue'

export default defineComponent({
  data: () => ({
    count: 1
  }),
  computed: {
    double() {
      return this.count * 2
    }
  },
})
```
```vue
import { ref, computed } from 'vue'

const count = ref(1)
const double = computed(() => count.value * 2)
```
````
</pre>

## Settings

You can set the `duration`, `stagger`, `lineNumbers` animation option and select any theme you like in the settings tab. All settings are effective immediately.

![settings](https://github.com/user-attachments/assets/8701b8b0-999d-47fd-82ce-cc0ba4f0caac)

## TODO

- mix Magic Move with line highlighting
- living preview
