
import { DicesDialog } from "./dices-dialog.js";

export class ActorListDialog extends Dialog {
    constructor(options) {
        super(options);

        this.filter = "KG.Owner";
        this.actors = this.getActors();

        this.data = {
            title: game.i18n.localize("KG.SelectActors"),
            content: this.getContent(),
            buttons: {
                "cancel": {
                    icon: '<i class="fas fa-times"></i>',
                    label: game.i18n.localize("DIALOG.Cancel"),
                    callback: () => console.log("Canceled")
                },
                "select": {
                    icon: '<i class="fas fa-check"></i>',
                    label: game.i18n.localize("DIALOG.Select"),
                    callback: () => this._submit()
                }
            },
            default: "select"
        };

    }

      /** @override */
	static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            template: "templates/hud/dialog.html",
            classes: ["kamigakari", "dialog"],
            width: 400
        });
    }

    /** @override */
	activateListeners(html) {
        super.activateListeners(html);
        
        html.find('#test').on('click', this.changeCharacter.bind(this, html));
    }

    getContent() {
        let viewName = game.i18n.localize(this.filter);
        let content = 
        `<h2 class="flexrow" style="padding-bottom: 2px; margin-bottom: 4px;">
            <span>${game.i18n.localize("KG.SelectActors")}</span>
            <button style="flex: 0; white-space: nowrap;" id="test">${viewName}</button>
        </h2>`;
        content += '<select id="actor-select-dialog" multiple style="width: 100%; height: 480px">';

        for (let item of this.actors) {
            content += `<option value="${item._id}">${item.name}</option>`;
        }
        content += '</select></div>';

        return content;
    }

    async _submit() {
        var selected = $("#actor-select-dialog").val();
        var dialog = new DicesDialog(selected, {}).render(true);
    }

    getActors() {
        switch (this.filter) {
        case "KG.Players":
            let userActorId = game.users
                .map(user => user.character)
                .filter(character => !!character)
                .map(character => character.id);
            return game.actors.filter(
                e => e.type == "character" &&
                (e.ownership['default'] >= 2 || e.ownership[game.user.id] >= 2) &&
                userActorId.includes(e.id)
            );
        case "KG.Observer":
            return game.actors.filter(
                e => e.type == "character" &&
                (e.ownership['default'] >= 2 || e.ownership[game.user.id] >= 2)
            );
        default: // case "KG.Owner":
            return game.actors.filter(
                e => e.type == "character"
                && (e.ownership['default'] == 3 || e.ownership[game.user.id] == 3)
            );
        }
    }

    async changeCharacter(html) {
        if (this.filter === 'KG.Players') this.filter = "KG.Owner";
        else if (this.filter === 'KG.Observer') this.filter = "KG.Players";
        else this.filter = "KG.Observer"; // (this.filter === 'KG.Owner')

        this.actors = this.getActors();

        this.data.content = this.getContent();
        this.render(true);
    }

}
