import { db } from '../config/database.js';
import { savePhotoInStorage } from '../lib/utils.js';
import usersModel from './users.js';
import admin from 'firebase-admin';
class vehiclesModel {
  static async getAllVehicles() {
    try {
      const snapshot = await db.collection('vehicles').get();
      const rides = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      return rides;
    } catch (error) {
      console.error('Error obteniendo rides:', error);
    }
  }
  static async createVehicle(vehicleData, vehiclePhoto, soat) {
    await uniqueVehicle(vehicleData);
    const finalData = await saveVehicleInFirestore(
      vehicleData,
      vehiclePhoto,
      soat
    );
    await usersModel.patchUserVehicle(vehicleData.id_driver, vehicleData.plate);
    return finalData;
  }
  static async getVehicleByPlate(plate) {
    const vehicle = await db.collection('vehicles').doc(plate).get();
    if (!vehicle.exists) {
      throw new Error('This vehicle plate does not exists');
    }
    return vehicle.data();
  }
  static async addRideToVehicle(rideId, plate) {
    const vehicleRef = db.collection('vehicles').doc(plate);

    await vehicleRef.update({
      rides: admin.firestore.FieldValue.arrayUnion(rideId),
    });
  }
}
async function uniqueVehicle(vehicleData) {
  const snapshot = await db.collection('vehicles').doc(vehicleData.plate).get();
  if (snapshot.exists) {
    throw new Error('This Plate Exist');
  }
  const snapshot2 = await db
    .collection('users')
    .doc(vehicleData.id_driver)
    .get();
  if (!snapshot2.exists) {
    throw new Error('This driver ID does not exists');
  }
  const snapshot3 = await db
    .collection('vehicles')
    .where('id_driver', '==', vehicleData.id_driver)
    .get();
  if (!snapshot3.empty) {
    throw new Error('A driver can only have a vehicle');
  }
}
async function saveVehicleInFirestore(vehicleData, vehiclePhoto, soat) {
  const { plate } = vehicleData;
  const vehiclePhotoUrl = await savePhotoInStorage(vehiclePhoto);
  const soatUrl = await savePhotoInStorage(soat);
  const finalData = { ...vehicleData, SOAT: soatUrl, photo: vehiclePhotoUrl };

  await db.collection('vehicles').doc(plate).set(finalData);
  return finalData;
}

export default vehiclesModel;