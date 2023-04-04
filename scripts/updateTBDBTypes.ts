/* eslint-disable no-console */
import path from 'path';
import fs from 'fs';

require('dotenv').config();

export default updateTripbotDatabaseTypes;

export async function updateTripbotDatabaseTypes() {
  console.log('Started updateTripbotDatabaseTypes');
  // This script will check if the /repos/TripBot/ folder exists
  // If so, it will replace /repos/TripBot/src/global/@types/database.d.ts
  // with /repos/http-api/type-output/database.d.ts
  // This is so that the typescript definitions are always up to date
  // with the database schema

  // console.log(`Current directory: ${__dirname}`);

  const tripbotPath = path.resolve(__dirname, '../../TripBot');
  // console.log('TripBot path:', tripbotPath);
  const tripbotDatabaseTypesPath = path.resolve(tripbotPath, 'src/global/@types/database.d.ts');
  const tripbotDatabaseTypesExists = fs.existsSync(tripbotDatabaseTypesPath);
  if (!tripbotDatabaseTypesExists) {
    console.log('TripBot database types file does not exist, skipping update');
    return;
  }

  const httpApiPath = path.resolve(__dirname, '../');
  // console.log('http-api path:', httpApiPath);
  const httpApiDatabaseTypesPath = path.resolve(httpApiPath, 'type-output/database.d.ts');
  // console.log('http-api database types path:', httpApiDatabaseTypesPath);
  const httpApiDatabaseTypesExists = fs.existsSync(httpApiDatabaseTypesPath);
  if (!httpApiDatabaseTypesExists) {
    console.log('http-api database types file does not exist, skipping update');
    return;
  }

  const tripbotDatabaseTypes = fs.readFileSync(tripbotDatabaseTypesPath, 'utf8');
  const httpApiDatabaseTypes = fs.readFileSync(httpApiDatabaseTypesPath, 'utf8');

  if (tripbotDatabaseTypes === httpApiDatabaseTypes) {
    console.log('TripBot database types file is up to date, skipping update');
    return;
  }

  console.log('TripBot database types file is out of date, updating');
  fs.writeFileSync(tripbotDatabaseTypesPath, httpApiDatabaseTypes, 'utf8');

  // log.info(F, 'Committing changes to TripBot');
  // exec(`cd ${tripbotPath} && git add . && git commit -m "Update database types" && git push`, (err, stdout, stderr) => {
  //   if (err) {
  //     log.error(F, err);
  //     return;
  //   }
  //   log.info(F, stdout);
  //   log.info(F, stderr);
  // });

  console.log('Finished updateTripbotDatabaseTypes');
  process.exit(200);
}

updateTripbotDatabaseTypes().catch(err => {
  console.log(err);
  process.exit(200);
});
