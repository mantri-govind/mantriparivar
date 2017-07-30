<html>
  <head>
    <script src="bower_components/jquery/dist/jquery.min.js"></script>
    <script src="bower_components/handlebars/handlebars.min.js"></script>
    <link rel="stylesheet" type="text/css" href="style/book.css">
  </head>
  <body>
    <input type="text" id="search" placeholder="Find a person by name..."></input>
    <h1></h1>
    <p id="instructions"><em>अगली पीढ़ी की जानकारी के लिए फोटो पे टच करे </em></p>
    <p>इस चार्ट को पारिवारिक वृक्ष की तरह देखने के लिए <a href="tree.php">यहाँ क्लिक करे</a></p>
    <small>कोई भी नाम मैं संसोधन, जानकारी  व फोटो जुड़वाने के लिए संसोधित जानकारी ईमेल करे : 
mantri.govind@hotmail.com. यह चार्ट श्रीमान बजरंग लाल जी (स्व. श्री मुरलीधर जी मंत्री) के हस्तकृत चार्ट पे आधारति  हैं। 
</small>
    <div id="tree">
    </div>
       <!--<img src="{{image}}"> -->
    <script id="person-template" type="text/x-handlebars-template">
      <div class="person">
        {{#if image}}
       
          <img src="images/placeholder.png">
        {{else}}
          <img src="images/placeholder{{#isFemale}}-female{{/isFemale}}.png">
        {{/if}}
        {{#if children}}
          <span class="expand">+{{children.length}}</span>
        {{/if}}
        <div class="name-and-bio">
        <h2 class="name">
          {{#if english-name}}
            {{english-name}}
          {{else}}
            {{name}}
        {{/if}}
        </h2>
        <p class="bio">{{{bio}}}</p>
        </div>
        {{#each children}}
          <div class="child">
            {{> person}}
          </div>
        {{/each}}
      </div>
    </script>
    <script src="scripts/book.js" type="text/javascript"></script>
  </body>
<small> इस चार्ट का डिजिटलीकरण गोविन्द मंत्री (हुलासचंद चम्पालाल मंत्री) के द्वारा किया गया है.  किसी भी प्रकार की त्रुटि के लिए क्षमा करे.</small>
</html>
