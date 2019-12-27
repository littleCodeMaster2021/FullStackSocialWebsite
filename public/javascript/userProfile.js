/* global Dropzone */
/* eslint no-restricted-globals: ["error", "event"] */
/* eslint-disable no-control-regex */

Dropzone.options.uploadWidget = {
  paramName: 'file',
  maxFiles: 1,
  maxFilesize: 5,
  acceptedFiles: 'image/*',
  autoProcessQueue: false,
  addRemoveLinks: true,
  dictDefaultMessage: 'Drag an image here to upload, or click to select one',
  init() {
    const that = this;
    document.getElementById('postBtn').addEventListener('click', (e) => {
      const text = document.getElementById('postText').value;
      const strongRegex = new RegExp('<(.|\n)*?>');
      if (text.match(strongRegex)) {
        const alert = document.getElementById('alertText');
        alert.innerHTML = 'Invalid Input! Please do not use <>';
        alert.style = 'color: red; font-weight: bold;';
      } else if (this.getQueuedFiles().length > 0) {
        e.preventDefault();
        that.processQueue();
      } else {
        const alert = document.getElementById('alertText');
        alert.innerHTML = 'Please Upload a photo!';
        alert.style = 'color: red; font-weight: bold;';
      }
    });

    this.on('sending', (file, xhr, formData) => {
      const text = document.getElementById('postText').value;
      formData.append('text', text);
    });

    this.on('sending', (file, xhr, formData) => {
      const tag = document.getElementById('postTag').value;
      formData.append('tag', tag);
    });

    this.on('sending', (file, xhr, formData) => {
      const tagFriends = document.getElementById('showTagNotDisplay').innerHTML;
      formData.append('tagFriends', tagFriends);
    });

    this.on('success', () => {
      location.reload();
    });
  },
};
