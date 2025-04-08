<h1 align="center">Obisdian Magic Move</h1>

Obsidian Magic Move is a Obsidian (https://obsidian.md) plugin for animating code blocks. It based on [shiki-magic-move](https://github.com/shikijs/shiki-magic-move).

![OMM Gif](https://github.com/user-attachments/assets/7ceb9c02-2fd5-43a7-b05d-2ec3209510ff)

## Install

### Method 1:

1. Open Settings > community plugins
2. Turn off `Safe mode`
3. Click `Browse` button to browse plugins and search for `Magic Move`, or open this link `obsidian://show-plugin?id=magic-move` in your browser
4. Click `Install` button
5. After installed, go back community plugins window, and activate the newly installed plugin below installed plugins list

### Method 2:

1. Download the [latest release](https://github.com/imfenghuang/obsidian-magic-move/releases)
2. Extract `obsidian-magic-move` folder from the zip to your vault's plugins folder `<vault>/.obsidian/plugins/` (Note: `.obsidian` folder may be hidden, you need to show it firstly)
3. Open Settings > community plugins, reload and activate the plugin below installed plugins list

## Usage

- working in `Reading Mode`
- use **~~~magic-move** to wrap multiple code blocks
- or **~~~markdown:magic-move** for syntax highlighting in editing mode
- code block syntax is the same as you know
- support code highlighting

````
~~~markdown:magic-move
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
~~~
````

## Settings

You can set the `duration`, `stagger`, `lineNumbers` animation option and select any theme you like in the settings tab. All settings are effective immediately.

![settings](https://github.com/user-attachments/assets/8701b8b0-999d-47fd-82ce-cc0ba4f0caac)

## TODO

- mix Magic Move with line highlighting
- living preview
