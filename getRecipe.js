model = [{element: "recipeName",query: "#cphMiddle_cphMain_lblTitle"},{element: "recipeImageURL",query: "#cphMiddle_cphMain_imgRecipeThumb",image: true},{element: "recipeYield",query: "#cphMiddle_cphMain_lblYield"},{element: "recipeMethod",query: "ol.dirgroupitems > li",multiple: true},{element: "recipeIngredients",query: "ul.inggroupitems > li > span.content",multiple: true},{element: "recipeCookTime",query: "#cphMiddle_cphMain_lblTotalTime"}];


if(location.href=="http://www.pepperplate.com/recipes/default.aspx?123"){
  loopLoadMore(document).then(()=>{
    urlList = getURLList(DOMtoString(document));
    chrome.runtime.sendMessage({ urlList: urlList });
  });
  
}else{
  recipe = getRecipe(DOMtoString(document), model);
  console.log(recipe);
  chrome.runtime.sendMessage({ recipe: recipe });
}


function getURLList(htmlasText){
  domparser = new DOMParser();
  domdoc = domparser.parseFromString(htmlasText, 'text/html');
  elements = domdoc.querySelectorAll('div.item > p > a');
  output = [];
  for(element of elements){
    output.push(element.href);
  }
  return output;
}


function clickLoadMore(){
  var loadMore = document.getElementById("loadmorelink");
  loadMore.click();
  window.scrollTo(0,document.body.scrollHeight);
  console.log('load more clicked');
}

function loopLoadMore(htmlasText){
  htmlasText = DOMtoString(htmlasText);

  return new Promise(function(resolve, reject) {
  domparser = new DOMParser();
  domdoc = domparser.parseFromString(htmlasText, 'text/html');
  element = domdoc.querySelector('#reclistcount').textContent;
  numberOfRecipes = element.replace ( /[^\d.]/g, '' );
  numberOfClicks = Math.floor(numberOfRecipes / 20);
  console.log(numberOfClicks)
  var i = 0;
  while (i < numberOfClicks) {
    (function(i) {
      setTimeout(function() {
        clickLoadMore();
        if(i==(numberOfClicks-1)){
          console.log('done looping');
          setTimeout(function() {
            resolve();
          }, 1000) 
        }
      }, 1000 * i) 
    })(i++)
  }
});
}

function getRecipe(htmlasText, model) {
  domparser = new DOMParser();
  domdoc = domparser.parseFromString(htmlasText, 'text/html');
  output = {};
  output.sourceURL = location.href;
  for (component of model) {
  
    if (component.query && component.element != "testURL") {
      //console.log(component);
      if (component.query.charAt(0) == "[") { //Suggests the query is an array
        if (component.multiple) {
          output[component.element] = getMultipleFieldComponent(domdoc, component, true);
        } else {
          output[component.element] = getSingleFieldComponent(domdoc, component, false);
        }
      } else {
        if (component.multiple) {
          output[component.element] = getMultipleFieldComponent(domdoc, component, false);
        } else {
          output[component.element] = getSingleFieldComponent(domdoc, component, false);
        }
      }
    }
  }
  return output;
}

function getSingleFieldComponent(domdoc, component, isArray) {
  if (isArray) {
    queryArray = JSON.parse(component.query);
    queryStem = queryArray[0];
    queryExclude = queryArray[1];
    element = domdoc.querySelector(queryStem);
    duplicate = element.cloneNode(true);
    if (duplicate.querySelector(queryExclude)) {
      duplicate.querySelector(queryExclude).remove();
      return duplicate.textContent;
    } else {
      if (element) {
        return element.textContent;
      }
    }
  } else {
    if (component.image) {
      if (domdoc.querySelector(component.query)) {
        return domdoc.querySelector(component.query).src;
      } else {
        return "";
      }
    } else {
      if (domdoc.querySelector(component.query)) {
        return domdoc.querySelector(component.query).textContent;
      }
    }
  }
}

function getMultipleFieldComponent(domdoc, component, isArray) {
  if (isArray) {
    queryArray = JSON.parse(component.query);
    queryStem = queryArray[0];
    queryExclude = queryArray[1];
    elements = domdoc.querySelectorAll(queryStem);
    componentOutput = [];
    for (let element of elements) {
      duplicate = element.cloneNode(true);
      if (duplicate.querySelector(queryExclude)) {
        duplicate.querySelector(queryExclude).remove();
        componentOutput.push(duplicate.textContent.replace(/ +(?= )/g, '').replace(/(\r\n\t|\n|\r\t)/gm, "").trim());
      } else {
        componentOutput.push(element.textContent.replace(/ +(?= )/g, '').replace(/(\r\n\t|\n|\r\t)/gm, "").trim());
      }
    }
    return componentOutput;
  } else {
    elements = domdoc.querySelectorAll(component.query);
    componentOutput = [];
    for (let element of elements) {
      componentOutput.push(element.textContent.replace(/ +(?= )/g, '').replace(/(\r\n\t|\n|\r\t)/gm, "").trim());
    }
    return componentOutput;
  }
}


function DOMtoString(document_root) {
  var html = '',
    node = document_root.firstChild;
  while (node) {
    switch (node.nodeType) {
      case Node.ELEMENT_NODE:
        html += node.outerHTML;
        break;
      case Node.TEXT_NODE:
        html += node.nodeValue;
        break;
      case Node.CDATA_SECTION_NODE:
        html += '<![CDATA[' + node.nodeValue + ']]>';
        break;
      case Node.COMMENT_NODE:
        html += '<!--' + node.nodeValue + '-->';
        break;
      case Node.DOCUMENT_TYPE_NODE:
        // (X)HTML documents are identified by public identifiers
        html += "<!DOCTYPE " + node.name + (node.publicId ? ' PUBLIC "' + node.publicId + '"' : '') + (!node.publicId && node.systemId ? ' SYSTEM' : '') + (node.systemId ? ' "' + node.systemId + '"' : '') + '>\n';
        break;
    }
    node = node.nextSibling;
  }
  return html;
}
