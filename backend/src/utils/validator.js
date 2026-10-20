const validator =require("validator");

// req.body 

const validate = (data)=>{
   
    const mandatoryField = ['firstName',"emailId",'password'];

    const IsAllowed = mandatoryField.every((k)=> Object.keys(data).includes(k));//Putting it together: this line checks "does the incoming data contain ALL three required field names — firstName, emailId, password?" If even one is missing, .every() returns false, and IsAllowed becomes false, which triggers the throw new Error("Some Field Missing").

    if(!IsAllowed)
        throw new Error("Some Field Missing");

    if(!validator.isEmail(data.emailId))
        throw new Error("Invalid Email");

    if(!validator.isStrongPassword(data.password))
        throw new Error("Weak Password");
}

module.exports = validate;