export class KgRegisterHelpers {
  static init() {
    Handlebars.registerHelper('ifEquals', function(arg1, arg2, options) {
      return (arg1 == arg2) ? options.fn(this) : options.inverse(this);
    });

    Handlebars.registerHelper('local', function(arg) {
      return (arg != "") ? game.i18n.localize("KG." + arg) : "";
    });

    Handlebars.registerHelper('disable', function(arg) {
      const list = {notCheck: "KG.NotCheck", damage: "KG.AfterDamage", reduce: "KG.AfterReduce", round: "KG.AfterRound", battle: "KG.AfterBattle"};
      return game.i18n.localize(list[arg]);
    });
    
    Handlebars.registerHelper('validateDice', function(parts, options) {
      for (let p of parts) {
        if (p.faces != 6)
          return options.inverse(this);
      }
      return options.fn(this);
    });

    //
    preloadHandlebarsTemplates();

  }
}

/**
 * Define a set of template paths to pre-load. Pre-loaded templates are compiled and cached for fast access when
 * rendering. These paths will also be available as Handlebars partials by using the file name
 * (e.g. "kamigakari.item-description").
 * @returns {Promise}
 */
async function preloadHandlebarsTemplates() {
  const partials = [
    "sheet/item/parts/item-description.hbs",
  ].map(path => `systems/kamigakari/templates/${path}`);

  const paths = {};
  for (const path of partials) {
    paths[path.replace(".hbs", ".html")] = path;
    paths[`kamigakari.${path.split("/").pop().replace(".hbs", "")}`] = path;
  }

  return loadTemplates(paths);
}
