$(document).ready(function() {
  var context;

  var publicTree;
  var running = 1; // number of running asynchronous functions
  
  function parseTree (tree, replace) {
    if (typeof replace != "undefined") {
      replace.children = tree.children;
      parseTree(tree);
    } else if (tree.source) {
      running++;
      $.getJSON(tree.source, function(treeData) {
        running--;
        parseTree(treeData, tree)
      });
    } else if (tree.children) {
      $(tree.children).each(function(){
        parseTree(this)
      });
    }
  }

  $.getJSON("json/mantriprivar.json", function(treeData) {
    publicTree = treeData;
    parseTree(publicTree);
    running--;
  });


  function checkIfDone(){
    if (running > 0)
      setTimeout(checkIfDone,100);
    else
      drawTree(publicTree);
  }
  checkIfDone();


  function drawTree(data) {
    context = data;

    $("h1").html("स्वर्गीय टीकमचंद जी जालमचंद जी मंत्री परिवार  1843 से  2017 तक");

    var source   = $("#person-template").html();
    Handlebars.registerPartial("person", $("#person-template").html());
    var template = Handlebars.compile(source);
    var html     = template(context);
    $("#tree").html(html);

    $(".person").on("click", "img, .expand", function(e) {
      $(this).siblings(".child").slideToggle();

      // If you want to keep the bios hidden until clicked
      // $(this).siblings(".name-and-bio").find(".bio").slideToggle();

      if ($(this).hasClass("expand"))
        $(this).fadeToggle();
      else
        $(this).siblings(".expand").fadeToggle();
      e.stopPropagation();
    });
  };
});
