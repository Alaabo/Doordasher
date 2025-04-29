export type DBUser = {
    $id : string
    name : string ,
    email : string ,
    avatar? :string ,
    role : 'client' | 'driver' ,
    phone : string ,
    
}

export type RequestType = {
    $id? : string , 
    driverid?: string
    pickUpLan : number ,
    pickUpLon   : number,
    destinyLan  : number,
    destinyLon  :number,
    status  :   'pending' | 'accepted' | 'onRoad' | 'delivered' ,
    packageDetails : string ,
    price : number ,
    user : string ,
}

export type Transaction = {
    $id : string 
    amount : number 
    createdAt : Date
    request : string 
    driver : string
    user : string
    status : 'pending' | "completed" | "failed"
}

export type Businesses = {
    $id : string ,
    name : string ,
    lat : number ,
    lon : number ,
    menuproducts : [string] ,
    email : string ,
    phoneNumber : string
}

export type Menu ={
    $id : string ,
    name : string ,
    description : string ,
    price : number ,
    coverpic : string
}