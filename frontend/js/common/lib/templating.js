async function fetchMustacheTemplate(path, templateKey) {
  return fetch(path).then(response => response.text()).then(template => {
      Mustache.parse(template);
      templates[templateKey] = template;
  }).catch(error => console.log('Unable to get the template: ', error.message));
}