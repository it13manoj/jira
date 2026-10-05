<template>
  <div ref="editorRoot" class="code-editor" />
</template>

<script setup>
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { EditorState, Compartment } from '@codemirror/state'
import {
  defaultHighlightStyle,
  foldGutter,
  indentOnInput,
  syntaxHighlighting
} from '@codemirror/language'
import {
  drawSelection,
  dropCursor,
  EditorView,
  highlightActiveLine,
  highlightActiveLineGutter,
  keymap,
  lineNumbers
} from '@codemirror/view'
import {
  defaultKeymap,
  history,
  historyKeymap,
  indentWithTab
} from '@codemirror/commands'
import { css } from '@codemirror/lang-css'
import { html } from '@codemirror/lang-html'
import { java } from '@codemirror/lang-java'
import { javascript } from '@codemirror/lang-javascript'
import { json } from '@codemirror/lang-json'
import { markdown } from '@codemirror/lang-markdown'
import { yaml } from '@codemirror/lang-yaml'
import { oneDark } from '@codemirror/theme-one-dark'

const props = defineProps({
  modelValue: { type: String, default: '' },
  language: { type: String, default: '' },
  readonly: { type: Boolean, default: false },
  ariaLabel: { type: String, default: 'Source code editor' }
})

const emit = defineEmits(['update:modelValue'])
const editorRoot = ref(null)
const readonlyCompartment = new Compartment()
let editorView

const getLanguageExtension = path => {
  const extension = path.split('.').at(-1)?.toLowerCase()
  if (['js', 'jsx', 'mjs', 'cjs'].includes(extension)) return javascript()
  if (['ts', 'tsx', 'mts', 'cts'].includes(extension)) {
    return javascript({ typescript: true })
  }
  if (['html', 'htm', 'vue', 'xml', 'svg'].includes(extension)) return html()
  if (['css', 'scss', 'less'].includes(extension)) return css()
  if (['java'].includes(extension)) return java()
  if (['json', 'jsonc'].includes(extension)) return json()
  if (['md', 'markdown', 'mdx'].includes(extension)) return markdown()
  if (['yaml', 'yml'].includes(extension)) return yaml()
  return []
}

onMounted(() => {
  const readonlyExtensions = [
    EditorState.readOnly.of(props.readonly),
    EditorView.editable.of(!props.readonly)
  ]

  editorView = new EditorView({
    state: EditorState.create({
      doc: props.modelValue,
      extensions: [
        lineNumbers(),
        highlightActiveLineGutter(),
        foldGutter(),
        history(),
        drawSelection(),
        dropCursor(),
        indentOnInput(),
        highlightActiveLine(),
        syntaxHighlighting(defaultHighlightStyle, { fallback: true }),
        EditorState.tabSize.of(2),
        EditorView.lineWrapping,
        EditorView.contentAttributes.of({
          'aria-label': props.ariaLabel,
          spellcheck: 'false'
        }),
        readonlyCompartment.of(readonlyExtensions),
        keymap.of([...defaultKeymap, historyKeymap, indentWithTab]),
        getLanguageExtension(props.language),
        oneDark,
        EditorView.updateListener.of(update => {
          if (update.docChanged) {
            emit('update:modelValue', update.state.doc.toString())
          }
        })
      ]
    }),
    parent: editorRoot.value
  })
})

watch(
  () => props.modelValue,
  value => {
    if (!editorView || editorView.state.doc.toString() === value) return
    editorView.dispatch({
      changes: {
        from: 0,
        to: editorView.state.doc.length,
        insert: value
      }
    })
  }
)

watch(
  () => props.readonly,
  readonly => {
    if (!editorView) return
    editorView.dispatch({
      effects: readonlyCompartment.reconfigure([
        EditorState.readOnly.of(readonly),
        EditorView.editable.of(!readonly)
      ])
    })
  }
)

onBeforeUnmount(() => editorView?.destroy())
</script>

<style scoped>
.code-editor {
  min-height: 58vh;
  height: 100%;
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 4px;
  overflow: hidden;
}

.code-editor :deep(.cm-editor) {
  height: 100%;
  min-height: 58vh;
  font-size: 13px;
}

.code-editor :deep(.cm-scroller) {
  overflow: auto;
  font-family: 'Cascadia Code', Consolas, 'Courier New', monospace;
  line-height: 1.6;
}

.code-editor :deep(.cm-gutters) {
  border-right: 1px solid rgba(255, 255, 255, 0.08);
}
</style>
