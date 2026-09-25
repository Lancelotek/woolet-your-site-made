// Countries offered in the Bespoke shipping address (measurements + shipping form).
export const COUNTRY_CODES =
  "AE AR AT AU BE BG BR CA CH CL CN CO CY CZ DE DK EE EG ES FI FR GB GR HK HR HU ID IE IL IN IS IT JP KR LT LU LV MA MT MX MY NL NO NZ PE PH PL PT RO RS SA SE SG SI SK TH TR TW UA US VN ZA".split(
    " ",
  );

export const countryLabel = (code: string) => {
  try {
    return new Intl.DisplayNames(["en"], { type: "region" }).of(code) ?? code;
  } catch {
    return code;
  }
};
