var app = angular.module("Timba", ['angular-json-tree']);

app.controller('TimbaCtrl', function($scope,$http) {
  var timba;
  var palos=["bastos","copas","espadas","oros"];
  var valores=["01","02","03","04","05","06","07","10","11","12"];
  var cartas={};
  var carta_back;
  var mano=[];
  var pilas={};
  $scope.parsed={};
  $scope.exec_stack=[]; 
  var level=0;
  var interval;
  var running=false;
  var canvas = document.getElementById('timbaCanvas');
  var ctx = canvas.getContext('2d');
  var pattern;
  var n_images= palos.length*valores.length
  var editor = ace.edit("editor");
  editor.setTheme("ace/theme/monokai");
  editor.getSession().setMode("ace/mode/timba");
  //editor.setValue(test_tba1);
  //$('#editor').height($('editor_cont').height());
  $http.get("/test.tba").then(function(response) {
    editor.setValue(response.data);
  });
  $scope.speeds=["normal","rapida","maxima"];
  $scope.selectedSpeed="normal";
  var speeds_ms={"normal": 200,"rapida": 60,"maxima":10};
  $scope.load_cards=function(){
    for (var p = 0, len = palos.length; p < len; p++) {
      var vals={};
      cartas[palos[p]]=vals;
      for (var v = 0, len2 = valores.length; v < len2; v++) {    
        img=new Image();
        img.src = "img/cards/"+palos[p]+"_"+valores[v]+".png";
        vals[parseInt(valores[v])]=img;
        img.onload = function() {
          n_images--
          if (n_images === 0) {            
            $scope.$apply(function(){
              $scope.parse()
              //console.log($scope.salida)
              console.log($('#main_row').height());
              $('#canvas_cont').height($('#main_row').height());
              //canvas.height=$('#main_row').height();
              update_canvas();            
            })
          }
        }
      }    
    }
    //console.log(cartas);
  }
  var init=function(){
    carta_back = new Image();
    var imageObj = new Image();
    imageObj.src = 'img/bg.jpg';
    carta_back.src = 'img/cards/carta.png';
    imageObj.onload = function() {    
      pattern=ctx.createPattern(imageObj,"repeat");    
      carta_back.onload=function(){  
        $scope.load_cards();
      }
    }
  }
  function readSingleFile(e) {
    var file = e.target.files[0];
    if (!file) {
      return;
    }
    var reader = new FileReader();
    reader.onload = function(e) {
      var contents = e.target.result;
      editor.setValue(contents);
    };
    reader.readAsText(file);
  }    
  //document.getElementById('file-input').addEventListener('change', readSingleFile, false);

  var update_canvas=function(){
    ctx.rect(0,0, canvas.width, canvas.height);
    ctx.fillStyle=pattern;
    ctx.fill();
    var x=20 ;
    var y= 200;
    ctx.font = "20px serif";
    ctx.fillStyle = 'blue';
    //console.log(pilas);
    if(mano.length>0){
      //console.log(mano) ;
      var cont=mano[0];
      //console.log("mano: "+cont.estado+"\n\n");
      if(cont.estado==1){//boca arriba
        ctx.drawImage(cartas[cont.palo][parseInt(cont.num)],10,10);
      }else{
        ctx.drawImage(carta_back,10,10);
      }
    }
    for (pila in pilas) {
      y= 200
      //console.log(pila)
      ctx.fillText(pila,x,190);
      for (var p = 0, len = pilas[pila].length; p < len; p++) {        
        var cont=pilas[pila][p]; 
        if(cont.estado==1){//boca arriba
          ctx.drawImage(cartas[cont.palo][parseInt(cont.num)],x,y);  
          y+=18;
        }else{
          ctx.drawImage(carta_back,x,y);
          y+=10;
        }
      }
      x+=120;
    }
  } 
  var shuffle=function (a) {
    var j, x, i;
    for (i = a.length; i; i--) {
      j = Math.floor(Math.random() * i);
      x = a[i - 1];
      a[i - 1] = a[j];
      a[j] = x;
    }
  }
  var init_pilas=function(){
    pilas=[];
    for (var p = 0, len = $scope.parsed.pilas.length; p < len; p++) {        
      pilas[$scope.parsed.pilas[p].nombre]=[];
      switch($scope.parsed.pilas[p].contenido.tipo){
        case "vacio":
        break;
        case "lista":
          for (var c = 0, len2 = $scope.parsed.pilas[p].contenido.list.length; c < len2; c++) {          
            pilas[$scope.parsed.pilas[p].nombre].push($scope.parsed.pilas[p].contenido.list[c]);
          }
        break;
        case "mazo_completo":
          var e=$scope.parsed.pilas[p].contenido.estado;
          var ee=e;
          for (var i = 0, plen = palos.length; i < plen; i++) {              
            for (var j = 0, vlen = valores.length; j < vlen; j++) {
              //console.log({num: parseInt(valores[j]),palo: palos[i]})
              if (e==2){
                ee=Math.floor(Math.random() * 2);
              }
              pilas[$scope.parsed.pilas[p].nombre].push({num: parseInt(valores[j]),palo: palos[i],estado: ee})
            }
          }
          shuffle(pilas[$scope.parsed.pilas[p].nombre]);
        break;
        case "mazo_n_cartas":
          var e=$scope.parsed.pilas[p].contenido.estado;
          var ee=e;
          var tmp=[];
          for (var i = 0, plen = palos.length; i < plen; i++) {
            for (var j = 0, vlen = valores.length; j < vlen; j++) {
              //console.log({num: parseInt(valores[j]),palo: palos[i]})
              if (e==2){
                ee=Math.floor(Math.random() * 2);
              }
              tmp.push({num: parseInt(valores[j]),palo: palos[i],estado: ee})
            }
          }
          for (var k = 0; k < $scope.parsed.pilas[p].contenido.n ; k++){
            var i=Math.floor(Math.random() * tmp.length);              
            pilas[$scope.parsed.pilas[p].nombre].push(tmp[i]);
            tmp.splice(i,1);
          }          
        break;
      }        
    }
  }  
  var _run=function(sentencias){    
    var l=sentencias.length;
    for(var i=0;i<l;i++){
      //console.log(sentencias[i].type)
      switch(sentencias[i].type)
      {
        case "o"://operativas
          run_op(sentencias[i]);
        break;
        case "c":// control
          switch(sentencias[i].control)
          {
            case "w":
              while(cond(sentencias[i].conditions)){
                _run(sentencias[i].sentencias);
              }
            break;
            case "i":
              if(cond(sentencias[i].conditions)){
                _run(sentencias[i].on_true);
              }else{
                if(sentencias[i].on_false!=null){
                  _run(sentencias[i].on_false);
                }
              }
            break;
          }
        break;
      }
    }
  }
  var tomar=function(name){
    if (pilas[name].length>0){
      if(mano.length==0){
        mano.push(pilas[name].pop())
        //console.log(mano)          
      }else{
        $scope.stop();
        console.log("no puedo tomar, ya tengo carta en la mano");
      } 
    }else{
      $scope.stop();
      console.log("no puedo tomar, la pila "+name+" esta vacia");
    } 
  }
  var depositar=function(name){
    if(mano.length==1){
      pilas[name].push(mano.pop());          
    }else{
      console.log("no puedo depositar, no tengo carta en la mano");
      $scope.stop();
    }          
  }
  var invertir=function(){
    if(mano.length==1){
      //console.log("before "+mano.estado);      
      if(mano[0].estado==1){
        mano[0].estado=0;
      }else{
        mano[0].estado=1;
      }
      //console.log("after "+mano.estado+"\n\n");
    }else{
      console.log("no puedo invertir, no tengo carta en la mano");
      $scope.stop();
    } 
  };
  var run_op=function(op){
    console.log(op)    
    switch(op.op){
      case "t"://tomar
        tomar(op.name);
      break;
      case "d":// depositar
        depositar(op.name);
      break;
      case "i":// invertir
        invertir();
      break;
    }
    update_canvas();
  }
  var cond=function(conditions){
    var r=false;
    var c=conditions.length;
    for(var i=0;i<c;i++){
      switch(conditions[i].type){
        case "empty":
          if (!pilas.hasOwnProperty(conditions[i].name)){
            $scope.stop();
            console.log("no puedo comparar, la pila "+conditions[i].name+" no existe");
          }
          switch(conditions[i].cond){
            case "e":
              r=(pilas[conditions[i].name].length==0);              
            break;
            case "n":
              r=(pilas[conditions[i].name].length!=0);
            break;
          }
        break;
        case "estado":
          if(mano.length!=1){
            console.log("no puedo comparar, no tengo carta en la mano");
            $scope.stop();
          }
          switch(conditions[i].cond){
            case "e":
              r=(mano[0].estado==0);
            break;
            case "n":
              r=(mano[0].estado!=0);
            break;
          }
        break;
        case "valor":     
          if(mano.length!=1){
            console.log("no puedo comparar, no tengo carta en la mano");
            $scope.stop();
          }     
          switch(conditions[i].rel){
            case "eq":
              r= mano[0].num == conditions[i].num
            break;
            case "ne":
              r= mano[0].num != conditions[i].num
            break;
            case "gt":
              r= mano[0].num >  conditions[i].num
            break;
            case "lt":
              r= mano[0].num <  conditions[i].num
            break;
            case "gte":
              r= mano[0].num >= conditions[i].num
            break;
            case "lte":
              r= mano[0].num <= conditions[i].num
            break;
          }
          switch(conditions[i].cond){
            case "e":
              
            break;
            case "n":
              r=!r;
            break;
          }
        break;
        case "palo":
          if(mano.length!=1){
            console.log("no puedo comparar, no tengo carta en la mano");
            $scope.stop();
          }
          switch(conditions[i].cond){
            case "e":
              r=(mano[0].palo==conditions[i].palo);
            break;
            case "n":
              r=(mano[0].palo!=conditions[i].palo);
            break;
          }
        break;
        case "valor_tope":
        break;
        case "palo_tope":
        break;
      }
    }
    //console.log(r);
    return r;
  }
  
  var run_next=function(){    
    
    console.log("level: "+ level+" i="+$scope.exec_stack[level].i +" n="+$scope.exec_stack[level].n);
    
    var s=$scope.exec_stack[level].s[$scope.exec_stack[level].i];   
    switch(s.type)
    {
      case "o"://operativas
        run_op(s);
      break;
      case "c":// control        
        switch(s.control)
        {
          case "w":
            if(cond(s.conditions)){
              console.log("push while");
              level++;              
              $scope.exec_stack.push({ "i":0,"n": s.sentencias.length ,"s": s.sentencias,"control":"w","c":s.conditions})
              return;
            }
          break;
          case "i":
            if(cond(s.conditions)){
              level++;
              console.log("push if t");
              $scope.exec_stack.push({ "i":0,"n": s.on_true.length ,"s": s.on_true,"control":"if","c":s.conditions})
              return;
            }else{              
              console.log("push if f");
              if (s.on_false!= null){
                level++;
                $scope.exec_stack.push({ "i":0,"n": s.on_false.length ,"s": s.on_false, "control":"if","c":s.conditions})
                return;
              } 
            }
          break;
        }
      break;
    }
    
    $scope.exec_stack[level].i++;
    if($scope.exec_stack[level].control=="w"){//es un mientras
      console.log("mientras");
      if($scope.exec_stack[level].i>=$scope.exec_stack[level].n){        
        $scope.exec_stack[level].i=0;
        if(cond($scope.exec_stack[level].c))//evaluar condicion
        {
          console.log("mientras true");
        }else{
          console.log("mientras false");
          $scope.exec_stack.pop();
          level--;
          if(level>=0){
            console.log("level: "+level);
            $scope.exec_stack[level].i++;
          }
        }
      }
    }else{
      if($scope.exec_stack[level].i>=$scope.exec_stack[level].n){ 
        console.log("pop");    
        $scope.exec_stack.pop();
        level--;
        if(level>=0){
          console.log("level: "+level);
          $scope.exec_stack[level].i++;
        }
      }
    }
    if(level<0){
      clearInterval(interval);
    }
  }
  
  var init_stack=function(){
    level=-1;
    mano=[];
    $scope.exec_stack=[];
    running=false;
    if( $scope.parsed.sentencias && $scope.parsed.sentencias.length >0){      
      level=0;
      $scope.exec_stack.push({ "i":0,"n":$scope.parsed.sentencias.length ,"s": $scope.parsed.sentencias,"control": "","c":false});    
    }
  }
  $scope.next=function(){
    if(!running){
      init_stack();    
      running=true;
      update_canvas();
    }
    if(level>=0){
      run_next();
    }else{
      $scope.stop();
    }
  }
  $scope.stop=function(){
    clearInterval(interval);
    running=false;
  }
  $scope.run=function(){
    init_stack();
    init_pilas();
    update_canvas();
    running=true;
    if ($scope.selectedSpeed=="maxima"){
      _run($scope.parsed.sentencias);
    }else{
      interval=setInterval(function(){
        run_next();
      }, speeds_ms[$scope.selectedSpeed]);    
    }
    
    update_canvas();
  }
  $scope.parse= function (){ 
    console.log("parsing timba!!");
    init_stack();
    $scope.parsed={};
    try{
      //call the peg parser, if all went well create json representation of the tree, and create the stacks
      $scope.parsed=timba_parser.parse(editor.getValue().toLowerCase());
      //$scope.salida =JSON.stringify($scope.parsed, null, 2);      
      init_pilas();      
      update_canvas();
    }catch(err){
      // in case of syntax error, create error message and display it
      console.dir(err);
      if (!(typeof err.expected === 'undefined')){
        var expected=""
        err.expected.forEach(function (item,index,arr) {
          if (item.type == "literal"){
            expected+=", \""+item.text+"\"";
          }
        });
        $scope.salida = "se esperaba \"" +expected+ " pero se encontró \""+ err.found+"\" en la linea "+err.location.start.line+" columna "+err.location.start.column
      }else{
        $scope.salida=err;
      }
      //var range = new Range(err.location.start.line-1, err.location.start.column-1, err.location.end.line-1, err.location.end.column-1);
      //var marker = editor.getSession().addMarker(range,"ace_selected_word", "text");
      //editor.getSession().removeMarker(marker);        
      //editor.getSession().addMarker(range,"ace_active_line","background");
    }    
  }
  init();
});
