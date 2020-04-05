/*jshint esnext:true*/
'use strict';

const appointments = require('./appointments.json');
const api_helper = require('./api_helper')
const circuit = require('./circuit');


function get(id) {
    return new Promise(async (resolve, reject) => {
        let patient = {};
        let docList = []
        await api_helper.make_API_call('http://ccovidclinicbackend.centralindia.cloudapp.azure.com:3001/api/v1/users/'+id)
            .then(response => {
                patient= response.data;
            })
            .catch(error => {
                console.log(error)
            })
        await api_helper.make_API_call('http://ccovidclinicbackend.centralindia.cloudapp.azure.com:3001/api/v1/doctors')
            .then(response => {
                docList = response.data.filter((item)=>{return item.status===true});
            })
            .catch(error => {
                console.log(error)
            })
        if (docList.length<1 ) {
            reject(`Doctors Not Free`);
            return;
        }else{
            let doctor = docList[Math.floor(Math.random() * docList.length)]
            if(doctor.email){
                let doctorUserId = await circuit.resolveUserID(doctor.email)
                console.log(doctorUserId)
                if(doctorUserId === undefined || doctorUserId.length<=0){
                    reject(`Doctors Not Found ${doctor.email} not found.`);
                    return;
                }else{
                    patient.doctor ={
                        name:doctor.name,
                        userId:doctorUserId[0].userId
                    }
                }
            }
        }
        console.log(patient)
        resolve(patient);
    })
}

module.exports = {
  get
}