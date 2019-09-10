(function($) {
  "use strict";

  // preloader
  jQuery(document).ready(function($) {
    $(window).load(function() {
      setTimeout(function() {
        $("#preloader").fadeOut("slow", function() {});
      }, 1000);
    });
  });
  // preloader

  // start request to cities and countries and birthDate
  // ui
  const elements = {
    form: document.forms["validate-form"],
    country: document.getElementById("country"),
    city: document.getElementById("city"),
    dayOfBirth: document.getElementById("dayOfBirth"),
    monthOfBirth: document.getElementById("monthOfBirth"),
    yearOfBirth: document.getElementById("yearOfBirth")
  };

  const arrOfDays = [];
  for (let i = 1; i <= 31; i++) {
    let date = {
      name: i.toString().length < 2 ? `0${i}` : i,
      code: i
    };
    arrOfDays.push(date);
  }

  const arrOfMonth = [
    { name: "January", code: "01" },
    { name: "February", code: "02" },
    { name: "March", code: "03" },
    { name: "April", code: "04" },
    { name: "May", code: "05" },
    { name: "June", code: "06" },
    { name: "July", code: "07" },
    { name: "August", code: "08" },
    { name: "September", code: "09" },
    { name: "October", code: "10" },
    { name: "November", code: "11" },
    { name: "December", code: "12" }
  ];

  const arrOfYears = [];
  for (let i = 2010; i >= 1940; i--) {
    let year = {
      name: `${i}`,
      code: i
    };
    arrOfYears.push(year);
  }

  // custom request foo
  const http = async (url, options) => {
    const response = await fetch(url, options).then(response => {
      if (Math.floor(response.status / 100) !== 2) {
        return Promise.reject(response);
      }
      return response.json();
    });
    return response;
  };

  // service
  class LocationsService {
    constructor(http) {
      this.url = "https://aviasales-api.herokuapp.com";
      this.http = http;
    }
    async countries() {
      try {
        const response = await this.http(`${this.url}/countries`);
        return response;
      } catch (err) {
        console.log(err);
        return Promise.reject(err);
      }
    }
    async cities() {
      try {
        const response = await this.http(`${this.url}/cities`);
        return response;
      } catch (err) {
        console.log(err);
        return Promise.reject(err);
      }
    }
  }

  const locationsService = new LocationsService(http);

  // store
  class LocationsStore {
    constructor(api) {
      this.api = api;
      this.countries = {};
      this.cities = {};
    }

    async init() {
      const response = await Promise.all([
        this.api.countries(),
        this.api.cities()
      ]);

      const [countries, cities] = response;
      this.countries = countries;
      this.cities = cities;
      return response;
    }

    getCitiesBuCountryCode(code) {
      return this.cities.filter(city => city.country_code === code);
    }

    getCityByCityCode(code) {
      const city = this.cities.find(city => city.code === code);
      const {
        name_translations: { en: cityName }
      } = city;
      return cityName;
    }

    getCountryByCountryCode(code) {
      const country = this.countries.find(country => country.code === code);
      const {
        name_translations: { en: countryName }
      } = country;
      return countryName;
    }
  }

  const locationsStore = new LocationsStore(locationsService);

  // render
  class FormUi {
    constructor(el) {
      this.form = el.form;
      this.country = el.country;
      this.city = el.city;
      this.dayOfBirth = el.dayOfBirth;
      this.monthOfBirth = el.monthOfBirth;
      this.yearOfBirth = el.yearOfBirth;
    }

    renderCountries(countries) {
      const fragment = FormUi.generateSelectFragment(countries);
      this.country.appendChild(fragment);
    }

    renderCities(selectName, cities) {
      this[selectName].innerHTML = "";
      const fragment = FormUi.generateSelectFragment(cities);
      this[selectName].appendChild(fragment);
      this[selectName].disabled = false;
      this[selectName].focus();
    }

    renderDays(days) {
      const fragment = FormUi.generateSelectFragment(days);
      this.dayOfBirth.appendChild(fragment);
    }

    renderMonths(months) {
      const fragment = FormUi.generateSelectFragment(months);
      this.monthOfBirth.appendChild(fragment);
    }

    renderYears(years) {
      const fragment = FormUi.generateSelectFragment(years);
      this.yearOfBirth.appendChild(fragment);
    }

    static generateSelectFragment(arr) {
      const fragment = document.createDocumentFragment();
      arr.forEach(({ name, code }) => {
        const option = FormUi.optionTemplate(name, code);
        fragment.appendChild(option);
      });

      return fragment;
    }

    static optionTemplate(label, value) {
      return new Option(label, value);
    }
  }

  const formUi = new FormUi(elements);

  // /////////////////////////////

  initApp();

  async function initApp() {
    await locationsStore.init();
    formUi.renderCountries(locationsStore.countries);
    formUi.renderDays(arrOfDays);
    formUi.renderMonths(arrOfMonth);
    formUi.renderYears(arrOfYears);
  }

  function onCounryChange(type, value) {
    const cities = locationsStore.getCitiesBuCountryCode(value);
    formUi.renderCities(type, cities);
  }

  country.addEventListener("change", e => {
    onCounryChange("city", country.value);
  });

  /*==================================================================
    [ Validate ]*/

  const input = $(".validate-input .input100");

  $(".validate-form").on("submit", function(e) {
    e.preventDefault();
    let check = true;

    for (let i = 0; i < input.length; i++) {
      if (validate(input[i]) == false) {
        showValidate(input[i]);
        check = false;
      }
    }

    // validation repeatPass === password
    const password = $('input[name="pass"]').val();
    const repeatPass = $('input[name="repeatPass"]');
    if (repeatPass.val() !== password) {
      showValidate(repeatPass.closest(".validate-input .input100"));
      check = false;
    }

    if (check) {
      const email = $('input[name="email"]').val();
      const nickname = $('input[name="nickName"]').val();
      const first_name = $('input[name="firstName"]').val();
      const last_name = $('input[name="lastName"]').val();
      const phone = $('input[name="phone"]').val();
      const gender_orientation = $('select[name="gender"]').val();
      const cityCode = $('select[name="city"]').val();
      const city = locationsStore.getCityByCityCode(cityCode);
      const countryCode = $('select[name="country"]').val();
      const country = locationsStore.getCountryByCountryCode(countryCode);
      const date_of_birth_day = Number($('select[name="dayOfBirth"]').val());
      const date_of_birth_month = Number(
        $('select[name="monthOfBirth"]').val()
      );
      const date_of_birth_year = Number($('select[name="yearOfBirth"]').val());

      const fetchDataObj = {
        email,
        password,
        nickname,
        first_name,
        last_name,
        phone,
        gender_orientation,
        city,
        country,
        date_of_birth_day,
        date_of_birth_month,
        date_of_birth_year
      };
      signup(fetchDataObj);
    }
  });

  $(".validate-form .input100").each(function() {
    $(this).focus(function() {
      hideValidate(this);
    });
  });
  $(".validate-form .select100").each(function() {
    $(this).focus(function() {
      hideValidate(this);
    });
  });

  function validate(input) {
    const regExpDic = {
      email: /^([a-zA-Z0-9_\-\.]+)@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.)|(([a-zA-Z0-9\-]+\.)+))([a-zA-Z]{1,5}|[0-9]{1,3})(\]?)$/,
      password: /^(?=.*\d)(?=.*[a-z])[0-9a-zA-Z]{6,}$/,
      phone: /^(\s*)?(\+)?([- _():=+]?\d[- _():=+]?){10,14}(\s*)?$/,
      name: /^[a-zA-Z]+$/,
      date: /^-?[\d.]+(?:e-?\d+)?$/
    };

    const regExpName = $(input).attr("data-required");

    if (regExpDic[regExpName]) {
      return regExpDic[regExpName].test($(input).val());
    }

    const dateValidate = $(input).attr("data-required-number");

    if (regExpDic[dateValidate]) {
      return regExpDic[dateValidate].test(Number($(input).val()));
    }

    return true;
  }

  function showValidate(input) {
    let thisAlert = $(input).parent();

    $(thisAlert).addClass("alert-validate");
  }

  function hideValidate(input) {
    let thisAlert = $(input).parent();

    $(thisAlert).removeClass("alert-validate");
  }

  async function signup(obj) {
    const url = "https://mlp-demo.herokuapp.com/api/public/auth/signup";
    const data = JSON.stringify(obj);
    const headers = {
      "Content-Type": "application/json"
    };

    try {
      const response = await $.ajax({
        url,
        data,
        headers,
        method: "POST"
      });

      window.location = "home.html";
    } catch (err) {
      console.log(err);
    }
  }
})(jQuery);
