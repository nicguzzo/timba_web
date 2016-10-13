start = programa

programa =  defprog sentencias: sentencias _ ";" _ defpilas _ pilas: lista_de_pilas? _ "."  { return {sentencias: sentencias,pilas: pilas}; }

defprog  = "definicion" __ "de" __ "programa" __

defpilas = "ucp" __ "ejecute" __ "con" __ "las" __ "siguientes" __ "cartas" _ ":" 

sentencias = head: sentencia tail:( comma s: sentencia  { return s; } )* {
  var result = [];
  [head].concat(tail).forEach(function(element) {  
    result.push(element);
  });  
  return result;
}

sentencia = operativa / control 

operativa  = tomar / depositar / invertir

tomar = tome __ "de" __ pila __  name: nombrepila _ { return {type: 'o', op: 't', name: name}; }

tome = ("tome" (__ "una" (__ "carta")? ) ? )

depositar = deposite __ "en" __ pila __ name: nombrepila _ { return {type: 'o', op: 'd', name: name}; }

deposite = "depositela" / ("deposite" __ carta)

invertir = invierta _ { return {type: 'o', op: 'i'}; }

invierta = "inviertala" / ("invierta" __ carta)

nombrepila = name: [a-zA-Z0-9]+ {return name.join("")}

control = seleccion / iterativa

iterativa = "mientras" __ condiciones: condicion __ sentencias: sentencias _ "repita" __ {
  return {type: 'c', control: "w",conditions: condiciones, sentencias: sentencias };
}

seleccion = "si" __ condiciones: condicion __ on_true: sentencias? __ "sino" __ on_false: (sentencias __ )? "nada" __ "mas" _ {
  var f=[];
  var t=[];
  if (!(typeof on_true === 'undefined')){
    f=on_false;
  }
  if (!(typeof on_false === 'undefined')){
    f=on_false;
  }
  return {type: 'c', control: "i",conditions: condiciones, on_true: t,on_false: f};
}

condicion =  head: condicion_simple tail:( __ ( and: "y" / or: "o" )  __ cs: condicion_simple { return cs;} )* {
  var result = [];
  [head].concat(tail).forEach(function(element) {  
    result.push(element);
  });  
  return result;
}

condicion_simple = c:condicion_pila_vacia {return c;}

condicion_pila_vacia = pila __ name: nombrepila __ cond: esta_no_esta  __ "vacia" {

  return {type: "empty", name: name, cond: cond};
}
esta_no_esta = empty: ( "esta" ) / not_empty: ( "no" __ "esta"  ) {
  var result={};
  if (!(typeof empty === 'undefined')){
    result = "e";
  }
  if (!(typeof not_empty === 'undefined')){
    result = "n";
  }
  return result;
}

lista_de_pilas = head: descripcion_de_pila tail:(_ comma _ desc:descripcion_de_pila _ {return desc;} )* {
  var result = [];
  [head].concat(tail).forEach(function(element) {  
    result.push(element);
  });  
  return result;
}

descripcion_de_pila = pila __ nombre:nombrepila __ contenido:contenido _ {
  return {nombre: nombre, contenido: contenido};
}

contenido = cont:(vacio / mazo / tiene){return cont;}

tiene = tiene:("tiene" __ cartas: lista_de_cartas {return cartas;}) { return tiene; }

vacio= vacio: ( "no" __ "tiene" __ "cartas" ) { return  {tipo: "vacio"};}

mazo =  "tiene" __ "un" __ "mazo" n:(__ "de" __ m:[0-9]+ __ "cartas" {return m;} )?  _ e:("^" / "_^")? {
  var m=0;
  var s=0;  
  if (!(typeof e === 'undefined')){
    console.log("e: "+e);
    if(e=="^"){
      s=1;
    }else{
      if(e=="_^"){
       s=2;
      }
    }
  }
  if (!(typeof n === 'undefined')){    
    m=parseInt(n.join(""));
    return {tipo: "mazo_n_cartas", estado: s,n: m}; 
  }else{
    return {tipo: "mazo_completo", estado: s}; 
  }
  
}

lista_de_cartas = head: descripcion_de_carta tail:( _ "-" _ desc:descripcion_de_carta _ {return desc;})* {
  var result = [];
  [head].concat(tail).forEach(function(element) {  
    result.push(element);
  });  
  return  {tipo: "lista", list:result};
}

descripcion_de_carta = num:numero __ "de" __ palo:palos _ inv: "^"? {
  var e=0;
  if (!(typeof inv === 'undefined')){
    e=1;
  }
  return {num: num, palo: palo, estado: e};
}

palos = "bastos" / "copas" / "espadas" / "oros"
numero = "1" / "2" / "3" / "4" / "5" / "6" / "7" / "10" / "11" / "12"

pila =  ("la" __ )? "pila"
carta = ("la" __ )? "carta"
par_l = "("*

par_r = ")"*
comma = _ "," _
// optional whitespace
_  = [ \t\r\n]*

// mandatory whitespace
__ = [ \t\r\n]+