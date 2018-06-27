# LAB 11-Express

## Travis Badge
[![Build Status](https://travis-ci.org/LizabethPetersen/11-12-mongodb-express-api.svg?branch=master)](https://travis-ci.org/LizabethPetersen/11-12-mongodb-express-api)

## Documentation
I am creating an api of user motorcycles. The resource will include a user's name, make, model, year, color, and brief description of their bike. The database will assign a unique index number (id), and the created on date. 

### Routes
##### POST api/motorcycles/{}
Create a new instance of an object, with unique user name and make and model required. Mongoose Schema is called motorcycleSchema 
{
    user: {
    type: String,
    required: true,
    unique: true,
  },
  make: {
    type: String,
    required: true,
  },
  model: {
    type: String,
    required: true,
  },
  year: {
    type: Number,
  },
  color: {
    type: String,
  },
  description: {
    type: String,
    minLength: 20,
  },
  createdOn: {
    type: Date,
    default: () => new Date(),
  },
}

##### GET api/motorcycles/{endpoint}
Retrieve resources using the index (params._id) of the object

##### PUT api/motorcycles/{endpoint}
Update resources using the index (params._id) to find and replace data

##### DELETE api/motorcycles/{endpoint}
Deletes a resource from the database, using the index of the resource (params._id)