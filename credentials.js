
chrome.runtime.onMessage.addListener(
  function (message, sender, sendResponse) {
    if (message.urlList) {
      urlList = message.urlList;
      i = 1;
      move(1,urlList.length);
      chrome.tabs.query({ currentWindow: true, active: true }, function (tab) {
        chrome.tabs.update(tab.id, { url: urlList[0] });
      });
      recipes = [];
      console.log(message);
    } else if (message.recipe) {
      var found = recipes.some(function (el) {
        return el.sourceURL === message.recipe.sourceURL;
      });
      if (!found) {
        recipes.push(message.recipe);
        if (i < urlList.length) {
       // if(i<3){  
            move(i,urlList.length);
          chrome.tabs.query({ currentWindow: true, active: true }, function (tab) {
            chrome.tabs.update(tab.id, { url: urlList[i]});
            i++;
          });
        } else {
          jsonArray = JSON.stringify(recipes);
          var blob = new Blob([jsonArray], {type: "application/json"});
          var url = URL.createObjectURL(blob);
          chrome.downloads.download({
            url: url, // The object URL can be used as download URL
            filename: 'pepperplateExport.json'
          });
          console.log(recipes);
        }
      }
    }
  }
);

chrome.tabs.onUpdated.addListener(function () {
  initApp();
});

window.onload = function () {
  chrome.tabs.query({ currentWindow: true, active: true }, function (tab) {
    chrome.tabs.update(tab.id, { url: 'http://www.pepperplate.com/recipes/default.aspx?123' });
  });
};


/**
FUNCTIONS
 */
function initApp() {
  chrome.tabs.executeScript(null, {
    file: "getRecipe.js",
    allFrames: false
  }, function () { });

}

function move(current,max) {
  var elem = document.getElementById("myBar"); 
  width=Math.round((current/max)*100);
  elem.style.width = width + '%'; 
  elem.innerHTML = width * 1 + '%';
}
