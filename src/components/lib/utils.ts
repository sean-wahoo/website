export const c = (...styles: string[]) => {
  return styles.join(" ");
};

export const debounce = <F extends (...args: Parameters<F>) => ReturnType<F>>(
  func: F,
  time: number,
) => {
  let timeout: NodeJS.Timeout;

  const debounced = (...args: Parameters<F>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), time);
  };
  return debounced;
};

export const STAR_COLORS = {
  M: {
    color: "red",
  },
  K: {
    color: "coral",
  },
  G: {
    color: "white",
  },
  F: {
    color: "white",
  },
  A: {
    color: "#27e7f5",
  },
  B: {
    color: "#27e7f5",
  },
  O: {
    color: "blue",
  },
};

export const STAR_FIELDS = {
  objectName: {
    id: "MAIN_ID",
    col: 3,
  },
  objectType: {
    id: "OTYPE_S",
    col: 4,
  },
  visualBlue: {
    id: "FLUX_B",
    col: 35,
  },
  visualRed: {
    id: "FLUX_R",
    col: 62,
  },
  visualGreen: {
    id: "FLUX_V",
    col: 44,
  },
  rightAscension: {
    id: "RA_d",
    col: 5,
  },
  declination: {
    id: "DEC_d",
    col: 6,
  },
  spectralType: {
    id: "SP_TYPE",
    col: 22,
  },
};

export interface TableInterface {
  [key: string]: any;
}
export const RADIUS = 12;

export function starToPixel(
  ra: number,
  dec: number,
  radiusDeg: number,
  centerRa: number,
  centerDec: number,
  width: number,
  height: number,
  fovDeg: number,
): [number, number] | null {
  const degToRad = Math.PI / 180;

  const raRad = ra * degToRad;
  const decRad = dec * degToRad;
  const centerRaRad = centerRa * degToRad;
  const centerDecRad = centerDec * degToRad;

  const deltaRa = raRad - centerRaRad;

  // Spherical angular separation
  const cosC = Math.max(
    -1,
    Math.min(
      1,
      Math.sin(centerDecRad) * Math.sin(decRad) +
        Math.cos(centerDecRad) * Math.cos(decRad) * Math.cos(deltaRa),
    ),
  );

  const angularDistance = Math.acos(cosC);

  if (cosC <= 0 || angularDistance > radiusDeg * degToRad) {
    return null;
  }

  // Gnomonic projection
  const x = (Math.cos(decRad) * Math.sin(deltaRa)) / cosC;

  const y =
    (Math.cos(centerDecRad) * Math.sin(decRad) -
      Math.sin(centerDecRad) * Math.cos(decRad) * Math.cos(deltaRa)) /
    cosC;

  // Exact gnomonic field-of-view scaling
  const scale = width / (2 * Math.tan((fovDeg * degToRad) / 2));

  const xPix = width / 2 + x * scale;
  const yPix = height / 2 - y * scale;

  if (xPix < 0 || xPix > width || yPix < 0 || yPix > height) {
    return null;
  }

  return [xPix, yPix];
}
export const parseVOTableData = (
  table: TableInterface,
  width: number,
  height: number,
) => {
  if (!table) return;
  const rawRows = table.VOTABLE.RESOURCE.TABLE.DATA.TABLEDATA.TR;

  const finalArr = [];
  for (let i = 0; i < rawRows.length; i++) {
    const row = rawRows[i];
    let starEntry: any = {};
    for (const [key, field] of Object.entries(STAR_FIELDS)) {
      const value = row.TD[field.col];
      starEntry[key] = value;
    }

    const centerPos = {
      a: 12.4736017,
      d: 31.4771192,
      x: width,
      y: height,
    };
    if (starEntry.declination === true || starEntry.rightAscension === true) {
      starEntry.rightAscension = centerPos.a;
      starEntry.declination = centerPos.d;
    }
    const convertedCoordinatesOther = starToPixel(
      Number(starEntry.rightAscension),
      Number(starEntry.declination),
      RADIUS,
      centerPos.a,
      centerPos.d,
      window.innerWidth,
      window.innerHeight,
      1,
    );

    if (!convertedCoordinatesOther) {
      continue;
    }

    starEntry.x = convertedCoordinatesOther[0];
    starEntry.y = convertedCoordinatesOther[1];

    finalArr.push(starEntry);
  }
  return finalArr;
};
