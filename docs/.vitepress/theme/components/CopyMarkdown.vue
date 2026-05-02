<template>
  <div class="copy-markdown-buttons">
    <button
      class="copy-markdown-btn"
      title="Copy Markdown"
      @click="copyMarkdown"
    >
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path>
        <rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect>
      </svg>
      <span>Copy Markdown</span>
    </button>
    <button
      class="copy-link-btn"
      title="Copy Markdown Link"
      @click="copyMarkdownLink"
    >
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
        <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
      </svg>
      <span>Copy Markdown Link</span>
    </button>
    <transition name="fade">
      <span v-if="showCopied" class="copy-feedback">{{ copiedText }}</span>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useData, useRoute } from 'vitepress'

const { page, site } = useData()
const route = useRoute()
const showCopied = ref(false)
const copiedText = ref('')

const getMarkdownContent = () => {
  // Get the markdown content from the current page
  const content = page.value.content || ''
  return content
}

const copyMarkdown = async () => {
  try {
    const content = getMarkdownContent()
    await navigator.clipboard.writeText(content)
    copiedText.value = 'Markdown copied!'
    showFeedback()
  } catch (err) {
    console.error('Failed to copy markdown:', err)
    copiedText.value = 'Failed to copy'
    showFeedback()
  }
}

const copyMarkdownLink = async () => {
  try {
    const title = page.value.title || site.value.title
    const url = window.location.href
    const markdownLink = `[${title}](${url})`
    await navigator.clipboard.writeText(markdownLink)
    copiedText.value = 'Link copied!'
    showFeedback()
  } catch (err) {
    console.error('Failed to copy markdown link:', err)
    copiedText.value = 'Failed to copy'
    showFeedback()
  }
}

const showFeedback = () => {
  showCopied.value = true
  setTimeout(() => {
    showCopied.value = false
  }, 2000)
}
</script>

<style scoped>
.copy-markdown-buttons {
  position: fixed;
  bottom: 80px;
  right: 20px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  z-index: 100;
}

.copy-markdown-btn,
.copy-link-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  background-color: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-divider);
  border-radius: 6px;
  cursor: pointer;
  font-size: 13px;
  color: var(--vp-c-text-1);
  transition: all 0.2s;
  white-space: nowrap;
}

.copy-markdown-btn:hover,
.copy-link-btn:hover {
  background-color: var(--vp-c-bg);
  border-color: var(--vp-c-brand-1);
  color: var(--vp-c-brand-1);
}

.copy-markdown-btn svg,
.copy-link-btn svg {
  flex-shrink: 0;
}

.copy-feedback {
  position: absolute;
  right: 0;
  bottom: -30px;
  padding: 4px 8px;
  background-color: var(--vp-c-brand-1);
  color: white;
  border-radius: 4px;
  font-size: 12px;
  white-space: nowrap;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

@media (max-width: 768px) {
  .copy-markdown-buttons {
    bottom: 60px;
    right: 10px;
  }

  .copy-markdown-btn span,
  .copy-link-btn span {
    display: none;
  }

  .copy-markdown-btn,
  .copy-link-btn {
    padding: 8px;
    width: 40px;
    height: 40px;
    justify-content: center;
  }
}
</style>
