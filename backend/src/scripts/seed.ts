import bcrypt from "bcryptjs";
import { connectDatabase } from "../config/db";
import { Driver } from "../modules/driver/driver.model";

async function seed() {
  await connectDatabase();
  const password = await bcrypt.hash("driver1234", 12);
  await Driver.findOneAndUpdate(
    { phone: "9999999999" },
    {
      name: "Demo Driver",
      email: "driver.demo@cab.local",
      phone: "9999999999",
      password,
      vehicleInfo: {
        make: "Maruti",
        model: "Dzire",
        plateNumber: "DL01AB1234",
        color: "White"
      },
      isOnline: false,
      currentLocation: { type: "Point", coordinates: [77.209, 28.6139] }
    },
    { upsert: true, new: true }
  );
  console.log("Seeded demo driver: phone=9999999999 password=driver1234");
  process.exit(0);
}

seed().catch((error) => {
  console.error(error);
  process.exit(1);
});
