// *** Ajax utility functions ***
(function (global) {

  var ajaxUtils = {};

  function getRequestObject() {
    if (window.XMLHttpRequest) {
      return (new XMLHttpRequest());
    }
    else if (window.ActiveXObject) {
      return (new ActiveXObject("Microsoft.XMLHTTP"));
    }
    else {
      global.alert("Ajax is not supported!");
      return (null);
    }
  }

  ajaxUtils.sendGetRequest =
    function (requestUrl, responseHandler, isJsonResponse) {
      var request = getRequestObject();
      request.onreadystatechange =
        function () {
          handleResponse(request,
            responseHandler,
            isJsonResponse);
        };
      request.open("GET", requestUrl, true);
      request.send(null);
    };

  function handleResponse(request,
    responseHandler,
    isJsonResponse) {
    if ((request.readyState == 4) &&
      (request.status == 200)) {

      if (isJsonResponse == undefined) {
        isJsonResponse = true;
      }

      if (isJsonResponse) {
        responseHandler(JSON.parse(request.responseText));
      }
      else {
        responseHandler(request.responseText);
      }
    }
  }

  global.$ajaxUtils = ajaxUtils;

})(window);


// *** Main script ***
(function (global) {

  var dc = {};

  var homeHtmlUrl = "snippets/home-snippet.html";
  var allCategoriesUrl =
    "https://coursera-jhu-default-rtdb.firebaseio.com/categories.json";
  var menuItemsUrl =
    "https://coursera-jhu-default-rtdb.firebaseio.com/menu_items/";

  var insertHtml = function (selector, html) {
    var targetElem =
      document.querySelector(selector);
    targetElem.innerHTML = html;
  };

  var showLoading = function (selector) {
    var html = "<div class='text-center'>";
    html += "<img src='images/ajax-loader.gif'></div>";
    insertHtml(selector, html);
  };

  var insertProperty = function (string, propName, propValue) {
    var propToReplace = "{{" + propName + "}}";
    string = string
      .replace(new RegExp(propToReplace, "g"), propValue);
    return string;
  };

  function chooseRandomCategory(categories) {
    var randomIndex = Math.floor(Math.random() * categories.length);
    return categories[randomIndex].short_name;
  }

  document.addEventListener("DOMContentLoaded", function () {

    showLoading("#main-content");

    $ajaxUtils.sendGetRequest(
      allCategoriesUrl,
      function (categories) {
        var randomCategoryShortName = chooseRandomCategory(categories);
        buildAndShowHomeHTML(categories, randomCategoryShortName);
      },
      true);
  });

  function buildAndShowHomeHTML(categories, randomCategoryShortName) {
    $ajaxUtils.sendGetRequest(
      homeHtmlUrl,
      function (homeHtml) {
        var homeHtmlToInsertIntoMainPage =
          insertProperty(homeHtml, "randomCategoryShortName", "'" + randomCategoryShortName + "'");
        insertHtml("#main-content", homeHtmlToInsertIntoMainPage);
      },
      false);
  }

  dc.loadMenuItems = function (categoryShort) {
    showLoading("#main-content");
    $ajaxUtils.sendGetRequest(
      menuItemsUrl + categoryShort + ".json",
      buildAndShowMenuItemsHTML);
  };

  function buildAndShowMenuItemsHTML(items) {
    var html = "<h2 class='text-center'>" + items.category.name + "</h2>";
    html += "<section class='row'>";
    for (var i = 0; i < items.menu_items.length; i++) {
      html += "<div class='col-md-6'><div class='menu-item-tile'>";
      html += "<div class='menu-item-title'>" + items.menu_items[i].name + "</div>";
      html += "<div class='menu-item-details'>" + items.menu_items[i].description + "</div>";
      html += "</div></div>";
    }
    html += "</section>";
    insertHtml("#main-content", html);
  }

  global.$dc = dc;

})(window);
