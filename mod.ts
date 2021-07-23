import { log } from "./deps.ts";
import { _ } from "./deps.ts";

interface Launch {
  flightNumber: number;
  mission: string;
  rocket: string;
  customers: string[];
}

const launches = new Map<number, Launch>();

async function downloadLaunchData() {
  log.info("Downloading launch data...");

  const response = await fetch("https://api.spacexdata.com/v3/launches", {
    method: "GET",
  });

  if (!response.ok) {
    log.warning("Problem downloading launch data.");
    throw new Error("Launch data download failed.");
  }

  const launchData = await response.json();

  for (const launch of launchData) {
    const payloads = launch["rocket"]["second_stage"]["payloads"];
    const customers = _.flatMap(payloads, (payload: any) => {
      return payload["customers"];
    });

    const flightData = {
      flightNumber: launch["flight_number"],
      mission: launch["mission_name"],
      rocket: launch["rocket"]["rocket_name"],
      customers,
    };

    launches.set(flightData.flightNumber, flightData);

    log.info(JSON.stringify(flightData));
  }
}

if (import.meta.main) {
  await downloadLaunchData();
  log.info(`Downloaded data for ${launches.size} SpaceX launches.`);
}
