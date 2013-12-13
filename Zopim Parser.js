// goo.gl/CevJ6G
Array.prototype.getUnique = function(){
   var u = {}, a = [];
   for(var i = 0, l = this.length; i < l; ++i){
      if(u.hasOwnProperty(this[i])) {
         continue;
      }
      a.push(this[i]);
      u[this[i]] = 1;
   }
   return a;
}

var lines = text.split('\n');
var urls = [];

for (var i = 0; i < lines.length; i++) {
	// is a url line
	if (lines[i].indexOf('http') !== -1) {
		var start = lines[i].indexOf('//') + 2;
		var end = lines[i].indexOf('.quickschools');
		urls.push(lines[i].substring(start, end));
	}
}

urls = urls.getUnique();