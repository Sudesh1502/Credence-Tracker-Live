import { grey } from '@mui/material/colors';
import createPalette from '@mui/material/styles/createPalette';
import { loadImage, prepareIcon } from './mapUtil';

import arrowSvg from '../../resources/images/arrow.svg';
import directionSvg from '../../resources/images/direction.svg';
import backgroundSvg from '../../resources/images/background.svg';

import busredSvg from '../../../public/TopView/AllTopViewVehicle/Top R.svg';
import busyellowSvg from '../../../public/TopView/AllTopViewVehicle/Top Y.svg';
import busgreenSvg from '../../../public/TopView/AllTopViewVehicle/Top G.svg';
import busorangeSvg from '../../../public/TopView/AllTopViewVehicle/Top O.svg';
import busgraySvg from '../../../public/TopView/AllTopViewVehicle/Top Grey.svg';

import carredSvg from '../../../public/TopView/AllTopViewVehicle/Car-R.svg';
import caryellowSvg from '../../../public/TopView/AllTopViewVehicle/Car-Y.svg';
import cargreenSvg from '../../../public/TopView/AllTopViewVehicle/Car-G.svg';
import carorangeSvg from '../../../public/TopView/AllTopViewVehicle/Car-O.svg';
import cargraySvg from '../../../public/TopView/AllTopViewVehicle/Car-Grey.svg';

import tractorredSvg from '../../../public/TopView/AllTopViewVehicle/Tractor-R.svg';
import tractoryellowSvg from '../../../public/TopView/AllTopViewVehicle/Tractor-Y.svg';
import tractorgreenSvg from '../../../public/TopView/AllTopViewVehicle/Tractor-G.svg';
import tractororangeSvg from '../../../public/TopView/AllTopViewVehicle/Tractor-O.svg';
import tractorgraySvg from '../../../public/TopView/AllTopViewVehicle/Tractor-Grey.svg';

import autoredSvg from '../../../public/TopView/AllTopViewVehicle/Auto-R.svg';
import autoyellowSvg from '../../../public/TopView/AllTopViewVehicle/Auto-Y.svg';
import autogreenSvg from '../../../public/TopView/AllTopViewVehicle/Auto-G.svg';
import autoorangeSvg from '../../../public/TopView/AllTopViewVehicle/Auto-O.svg';
import autograySvg from '../../../public/TopView/AllTopViewVehicle/Auto-Grey.svg';

import jcbredSvg from '../../../public/TopView/AllTopViewVehicle/JCB-R.svg';
import jcbyellowSvg from '../../../public/TopView/AllTopViewVehicle/JCB-Y.svg';
import jcbgreenSvg from '../../../public/TopView/AllTopViewVehicle/JCB-G.svg';
import jcborangeSvg from '../../../public/TopView/AllTopViewVehicle/JCB-O.svg';
import jcbgraySvg from '../../../public/TopView/AllTopViewVehicle/JCB-GREY.svg';

import truckredSvg from '../../../public/TopView/AllTopViewVehicle/Truck-R.svg';
import truckyellowSvg from '../../../public/TopView/AllTopViewVehicle/Truck-Y.svg';
import truckgreenSvg from '../../../public/TopView/AllTopViewVehicle/Truck-G.svg';
import truckorangeSvg from '../../../public/TopView/AllTopViewVehicle/Truck-O.svg';
import truckgraySvg from '../../../public/TopView/AllTopViewVehicle/Truck-Grey.svg';



import animalSvg from '../../resources/images/icon/animal.svg';
import bicycleSvg from '../../resources/images/icon/bicycle.svg';
import boatSvg from '../../resources/images/icon/boat.svg';
import busSvg from '../../resources/images/icon/Top G.svg';
import carSvg from '../../resources/images/icon/Car-G.svg';
import camperSvg from '../../resources/images/icon/camper.svg';
import craneSvg from '../../resources/images/icon/JCB-G.svg';
import defaultSvg from '../../resources/images/icon/default.svg';
import helicopterSvg from '../../resources/images/icon/helicopter.svg';
import motorcycleSvg from '../../resources/images/icon/motorcycle.svg';
import offroadSvg from '../../resources/images/icon/offroad.svg';
import personSvg from '../../resources/images/icon/person.svg';
import pickupSvg from '../../resources/images/icon/pickup.svg';
import planeSvg from '../../resources/images/icon/plane.svg';
import scooterSvg from '../../resources/images/icon/scooter.svg';
import shipSvg from '../../resources/images/icon/ship.svg';
import tractorSvg from '../../resources/images/icon/Tractor-G.svg';
import trainSvg from '../../resources/images/icon/train.svg';
import tramSvg from '../../resources/images/icon/tram.svg';
import trolleybusSvg from '../../resources/images/icon/trolleybus.svg';
import truckSvg from '../../resources/images/icon/Truck-G.svg';
import vanSvg from '../../resources/images/icon/van.svg';
import autoSvg from '../../resources/images/icon/Auto-G.svg';


export const mapIcons = {
  bus: {
    red: busredSvg,
    yellow: busyellowSvg,
    green: busgreenSvg,
    orange: busorangeSvg,
    gray: busgraySvg,
  },
  car: {
    red: carredSvg,
    yellow: caryellowSvg,
    green: cargreenSvg,
    orange: carorangeSvg,
    gray: cargraySvg,
  },
  tractor: {
    red: tractorredSvg, // Check this path
    yellow: tractoryellowSvg,
    green: tractorgreenSvg,
    orange: tractororangeSvg,
    gray: tractorgraySvg,
  },
  auto: {
    red: autoredSvg,
    yellow: autoyellowSvg,
    green: autogreenSvg,
    orange: autoorangeSvg,
    gray: autograySvg,
  },
  jcb: {
    red: jcbredSvg,
    yellow: jcbyellowSvg,
    green: jcbgreenSvg,
    orange: jcborangeSvg,
    gray: jcbgraySvg,
  },
  truck: {
    red: truckredSvg,
    yellow: truckyellowSvg,
    green: truckgreenSvg,
    orange: truckorangeSvg,
    gray: truckgraySvg,
  },
  default: carredSvg,
};

export const mapIconKey = (category) => (mapIcons.hasOwnProperty(category) ? category : 'default');

export const mapImages = {};

const mapPalette = createPalette({
  neutral: { main: grey[500] },
});

export default async () => {
  const background = await loadImage(backgroundSvg);
  // mapImages.background = await prepareIcon(background);
  mapImages.direction = await prepareIcon(await loadImage(directionSvg));
  mapImages.arrow = await prepareIcon(await loadImage(arrowSvg));
  await Promise.all(Object.keys(mapIcons).map(async (category) => {
    const results = [];
    ['red', 'yellow', 'green', 'orange', 'gray'].forEach((color) => {
      let vehicle = mapIcons[category];
      results.push(loadImage(vehicle[color]).then((icon) => {
        console.log("category and color==========", category, color);
        mapImages[`${category}-${color}`] = icon;
      }));
    });
    await Promise.all(results);
  }));
};
