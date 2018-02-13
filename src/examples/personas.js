var exports = (module.exports = {});


function persona_a()
{
    var obj = {}; 
    obj.first_name='Instant';
    obj.last_name='CI';
    obj.email='ci+targetcompany@bloomcode.io';
    obj.password='Abcd1234';
    obj.zip = "94708";
    obj.address1 = "123 My Way"; 
    obj.city = "Berkeley";
    obj.state =  "CA";
    obj.zip =  "94708";
    obj.phone = "(510)222-4444";
    return obj;
}

module.exports = {
    persona_a: persona_a()
}
