module("VIE - Type");

test("VIE - Type API", function() {
    
    var v = new VIE();
  
      // types
  
    ok(v.types);
    ok(typeof v.types === 'object');

    ok(v.types.vie);
    ok(v.types.vie instanceof VIE);
    
    ok(v.types.add);
    ok(typeof v.types.add === 'function');
    
    ok(v.types.addOrOverwrite);
    ok(typeof v.types.addOrOverwrite === 'function');
    
    ok(v.types.get);
    ok(typeof v.types.get === 'function');
    
    ok(v.types.remove);
    ok(typeof v.types.remove === 'function');
  
    ok(v.types.list);
    ok(typeof v.types.list === 'function');
    ok(v.types.toArray);
    ok(typeof v.types.toArray === 'function');
    
    // Type
    var thingy = v.types.add("TestTypeWithSillyName");
    
    ok (thingy);
    ok(thingy instanceof v.Type);
  
    ok(thingy.vie);
    ok(thingy.vie instanceof VIE);
    
    ok(thingy.id);
    ok(typeof thingy.id === 'string');
    ok(v.namespaces.isUri(thingy.id));
    
    ok(thingy.subsumes);
    ok(typeof thingy.subsumes === 'function');
    
    ok(thingy.isof);
    ok(typeof thingy.isof === 'function');
    
    ok(thingy.inherit);
    ok(typeof thingy.inherit === 'function');
    
    ok(thingy.attributes);
    ok(thingy.attributes instanceof v.Attributes);
        
    ok(thingy.hierarchy);
    ok(typeof thingy.hierarchy === 'function');
  
    ok(thingy.supertypes);
    ok(thingy.supertypes instanceof v.Types);
    
    ok(thingy.subtypes);
    ok(thingy.subtypes instanceof v.Types);
    
    ok(thingy.toString);
    ok(typeof thingy.toString === 'function');
});


test("VIE - Creation/Extension/Removal of types", function() {

    var v = new VIE();

    equal(v.types.get("TestThingy"), undefined);
    
    var thingy = v.types.add("TestThingy");

    var persony = v.types.add("TestPersony").inherit("TestThingy");
    ok(persony);
    ok(persony.isof(thingy));
    ok(thingy.subsumes(persony));
    
    ok (thingy.hierarchy());
    equal (typeof thingy.hierarchy(), 'object');
    var refHierarchy = {
        id : '<' + v.namespaces.base() + "TestThingy" + '>',
        subtypes: [
            {
                id : '<' + v.namespaces.base() + "TestPersony" + '>',
                subtypes: []
            }
        ]
    };
    deepEqual (thingy.hierarchy(), refHierarchy);
    
    ok(v.types.list());
    ok(jQuery.isArray(v.types.list()));
    equal(v.types.list().length, 3);
    equal(v.types.list()[0].id, v.types.get('Thing').id);
    equal(v.types.list()[1].id, thingy.id);
    equal(v.types.list()[2].id, persony.id);
    
    var animaly = v.types.add("TestAnimaly").inherit(thingy);
    
    var specialCreaturey = v.types.add("SpecialCreatuery").inherit(persony).inherit(animaly);

    equal(v.types.list().length, 5);
    equal(persony.subtypes.list().length, 1);
    equal(animaly.subtypes.list().length, 1);
    equal(specialCreaturey.supertypes.list().length, 2);
    
    var specialCreaturey2 = v.types.add("SpecialCreatuery2").inherit([persony, animaly]);
    equal(v.types.list().length, 6);
    equal(persony.subtypes.list().length, 2);
    equal(animaly.subtypes.list().length, 2);
    equal(specialCreaturey2.supertypes.list().length, 2);
    
    var veryspecialCreaturey = v.types.add("VerySpecialCreatuery").inherit("SpecialCreatuery");
    
    equal(v.types.list().length, 7);
    
    //removes only that type
    v.types.remove(veryspecialCreaturey);
    equal(v.types.list().length, 6);
    
    //recursively removes all types
    v.types.remove(thingy);
    equal(v.types.list().length, 1);
    
    
});