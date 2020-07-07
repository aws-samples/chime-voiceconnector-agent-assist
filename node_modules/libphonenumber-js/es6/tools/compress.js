export default function compress(input) {
  var countries = {};

  for (var _i = 0, _Object$keys = Object.keys(input.countries); _i < _Object$keys.length; _i++) {
    var countryCode = _Object$keys[_i];
    countries[countryCode] = compressNumberingPlan(input.countries[countryCode]);
  }

  var nonGeographic = {};

  for (var _i2 = 0, _Object$keys2 = Object.keys(input.nonGeographic); _i2 < _Object$keys2.length; _i2++) {
    var callingCode = _Object$keys2[_i2];
    nonGeographic[callingCode] = compressNumberingPlan(input.nonGeographic[callingCode]);
  }

  return {
    version: input.version,
    country_calling_codes: input.country_calling_codes,
    countries: countries,
    nonGeographic: nonGeographic
  };
}

function compressNumberingPlan(country) {
  // When changing this array also change getters in `./metadata.js`
  var country_array = [country.phone_code, country.idd_prefix, country.national_number_pattern, country.possible_lengths, // country.possible_lengths_local,
  country.formats && country.formats.map(function (format) {
    // When changing this array also change getters in `./metadata.js`
    var format_array = [format.pattern, format.format, format.leading_digits_patterns, format.national_prefix_formatting_rule, format.national_prefix_is_optional_when_formatting, format.international_format];
    return trimArray(format_array);
  }), country.national_prefix, country.national_prefix_formatting_rule, country.national_prefix_for_parsing, country.national_prefix_transform_rule, country.national_prefix_is_optional_when_formatting, country.leading_digits];

  if (country.types) {
    var types_array = [// These are common
    country.types.fixed_line, country.types.mobile, country.types.toll_free, country.types.premium_rate, country.types.personal_number, // These are less common
    country.types.voice_mail, country.types.uan, country.types.pager, country.types.voip, country.types.shared_cost].map(function (type) {
      return type && trimArray([type.pattern, type.possible_lengths // type.possible_lengths_local
      ]);
    });
    country_array.push(trimArray(types_array));
  } else {
    country_array.push(null);
  }

  country_array.push(country.default_idd_prefix);
  country_array.push(country.ext);
  return trimArray(country_array);
} // Empty strings are not considered "empty".


function isEmpty(value) {
  return value === undefined || value === null || value === false || Array.isArray(value) && value.length === 0;
} // Removes trailing empty values from an `array`


function trimArray(array) {
  // First, trim any empty elements.
  while (array.length > 0 && isEmpty(array[array.length - 1])) {
    array.pop();
  } // Then replace all remaining empty elements with `0`
  // and also `true` with `1`.


  return array.map(function (element) {
    if (isEmpty(element)) {
      return 0;
    }

    if (element === true) {
      return 1;
    }

    return element;
  });
}
//# sourceMappingURL=compress.js.map