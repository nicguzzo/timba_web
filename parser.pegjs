start = programa

programa = _ defprog sentencias: sentencias _ ";" _ defpilas _ pilas: lista_de_pilas? _ "." _  { return {sentencias: sentencias,pilas: pilas}; }

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

iterativa = "mientras" __ condiciones: condicion __ sentencias: sentencias _ "repita" _ {
  return {type: 'c', control: "w",conditions: condiciones, sentencias: sentencias };
}

seleccion = "si" __ condiciones:condicion __ on_true: (s:sentencias _ {return s;})? "sino" __ on_false: (s:sentencias _ {return s;})? "nada" __ "mas" _ {
  return {type: 'c', control: "i",conditions: condiciones, on_true: on_true,on_false: on_false};
}

condicion =  head:condicion_simple  tail:( _ op_logico:( "y" / "o" ) _  cs:condicion_simple  { return {cond_s: cs,op_logico:op_logico};} )*
{
  var result = [];  
  [head].concat(tail).forEach(function(element) {  
    result.push(element);
  });  
  return result;
}

condicion_simple = condicion_pila_vacia
                  / condicion_carta
                  / cond_val
                  / cond_suit
                  / cond_suit_top
                  / cond_val_top

condicion_pila_vacia = pila __ name: nombrepila __ cond: esta_no_esta  __ "vacia" {
  return {type: "empty", name: name, cond: cond};
}

condicion_carta = carta __ condi: esta_no_esta __ "boca" __ "abajo" {
  return {type: "estado", cond: condi};
}

esta_no_esta = n:( "no" __ )? "esta"  {
  var result="e";
  if (n!=null){
    result = "n";
  }  
  return result;
}
es_no_es = n:( "no" __ )? "es"  {
  var result="e";
  if (n!=null){
    result = "n";
  }  
  return result;
}

relac=       e:"igual"  / n:"distinto"
mayorigual = "mayor" __"o" __ "igual"
menorigual = "menor" __"o" __ "igual"
mayoriguala= mayorigual __ "a"
menoriguala= menorigual __ "a"
mayorque=    "mayor" __ "que"
menorque=    "menor" __ "que"
iguala=      "igual" __ "a"  
distintode=  "distinto" __ "de"
relacion=    gte:mayoriguala {return "gte";}/ 
             lte:menoriguala {return "lte";}/
             eq:iguala {return "eq";}/
             ne:distintode {return "ne";}/
             gt:mayorque {return "gt";}/
             lt:menorque {return "lt";}
relacion2=
  gte:mayorigual {return "gte";}/ 
  lte:menorigual {return "lte";}/
  eq:"igual" {return "eq";}/
  ne:"distinto" {return "ne";}/
  gt:"mayor" {return "gt";}/
  lt:"menor" {return "lt";}
devalor=  "de" __ "valor"
cond_val=       carta __ cond:es_no_es (__ devalor)? __ rel:relacion __ num:numero  {  
  return {type: "valor",cond:cond,rel:rel,num:num};
}
delpalo=        "del" __ "palo"
quetopede=      "que" __ "tope" __ "de"
paloquetopede=  "palo" __ quetopede
valorquetopede= "valor" __ quetopede
cond_suit=  carta __ cond:es_no_es _ delpalo? _ palo:palos  {
  console.log({type: "palo",cond:cond,palo:palo});
  return {type: "palo",cond:cond,palo:palo};
}
cond_suit_top=  carta "es"__ "de" _ rel:relac _  paloquetopede  _  pila _ nombre:nombrepila {
  return {type: "palo_tope",rel:rel,nombre:nombre};
}
cond_val_top=   carta condd:es_no_es _ "de" _ rel:relacion2 _ valorquetopede _ pila _ nombre:nombrepila {  
  return {type: "valor_tope",cond:cond,rel:rel,nombre:nombre};
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
descripcion_de_carta= descripcion_de_carta1 / descripcion_de_carta2

descripcion_de_carta1 = num:numero __ "de" __ palo:palos _ inv: "^"? {
  var e=0;
  if (!(typeof inv === 'undefined')){
    e=1;
  }
  return {num: parseInt(num), palo: palo, estado: e};
}
descripcion_de_carta2 = num:numero _ palo:[bceo] _ inv: "^"? {
  var e=0;
  if (!(typeof inv === 'undefined')){
    e=1;
  }
  var p={"b":"bastos" , "c":"copas" , "e":"espadas" , "o":"oros"};
  return {num: parseInt(num), palo: p[palo], estado: e};
}

palos = "bastos" / "copas" / "espadas" / "oros"
numero = "1" / "2" / "3" / "4" / "5" / "6" / "7" / "10" / "11" / "12"

pila =  ("la" __ )? "pila"
carta = ("la" __ )? "carta"
paren =  _ [\(\)] _


comma = _ "," _
// optional whitespace
_  = [ \t\r\n]*

// mandatory whitespace
__ = [ \t\r\n]+