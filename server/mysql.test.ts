import { MySQL } from './mysql.storage'

// Usage example
(async () => {
  const db = MySQL.getInstance();
  await db.init(); // Initialize the database connection
  const locations = await db.getLocations('2024-01-01', '2024-12-31');
  console.log(locations);

  try {
    const location = await db.getLocationByName('Sample Location');
    console.log(location);
  } catch (error) {
    console.error(error.message);
  }
})();
