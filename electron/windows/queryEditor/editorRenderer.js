let editor;
let filePath = '';

window.queryEditor.onLoad(({ filename, content, fullPath }) => {
  document.getElementById('file-title').innerText = filename;
  filePath = fullPath;

  editor = CodeMirror.fromTextArea(document.getElementById('code-area'), {
    mode: 'text/x-sql',
    theme: 'material-darker',
    lineNumbers: true,
    indentWithTabs: true,
    smartIndent: true,
    matchBrackets: true,
    autofocus: true
  });

  editor.setValue(content);
});

document.getElementById('save-btn').addEventListener('click', () => {
  const newContent = editor.getValue();
  window.queryEditor.saveFile(filePath, newContent);
});
