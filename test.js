var swig = require('swig');

swig.renderFile('views/index.html', {
  title: 'Fictional Characters',
  people: [{name: 'Gandalf'}, 
            {name:'Frodo'}, 
            {name:'Hermione'}]
},function (err, output) {
    console.log(output);
});