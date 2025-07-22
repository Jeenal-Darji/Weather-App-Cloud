import { db } from "../firebase";
import { collection, addDoc, getDocs, query, where } from "firebase/firestore";

// Function to add city only if it doesn't exist
export const addCity = async (cityName) => {
  try {
    const citiesCollection = collection(db, "cities");

    // Check if the city already exists
    const q = query(citiesCollection, where("name", "==", cityName));
    const querySnapshot = await getDocs(q);

    // If the city does not exist, add it
    if (querySnapshot.empty) {
      await addDoc(citiesCollection, {
        name: cityName
      });
      console.log("City added:", cityName);
    } else {
      console.log("City already exists in the database.");
    }
  } catch (error) {
    console.error("Error adding city: ", error);
 }
};
