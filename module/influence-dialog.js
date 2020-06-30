
export class InfluenceDialog extends Dialog {
    constructor(action, spirit, actor, modScore, options) {
        super(options);

        this.actionDice = action;
        this.spiritDice = JSON.parse(JSON.stringify(spirit));
        this.actor = actor;
        this.modScore = modScore;

        this.action = null;
        this.spirit = null;

        this.data = {
            title: "Influence",
            content: this.getContent(),
            buttons: {
                "cancel": {
                    icon: '<i class="fas fa-times"></i>',
                    label: "cancel",
                    callback: () => console.log("Canceled")
                },
                "apply": {
                    icon: '<i class="fas fa-check"></i>',
                    label: "Apply",
                    callback: () => this._submit()
                }
            },
            default: "apply"
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

        html.find(".action, .spirit").click(this._selectDice.bind(this));
        html.find(".dice-change").click(this._swapDice.bind(this));
    }

    getContent() {
        var content = "<p>What do you change dice?<br><br>Action Dice<br><div>";
        $(this.actionDice).each(element => {
            content += `<img class="action" width=45 height=45 data-index=${element} data-value=${this.actionDice[element]} src="systems/kamigakari/assets/dice/${this.actionDice[element]}.PNG">`;
        });
        content += "</div>Spirit Dice<br><div>";
        for (let [key, value] of Object.entries(this.spiritDice)) {
            content += `<img class="spirit" width=45 height=45 data-key=${key} data-value=${value} src="systems/kamigakari/assets/dice/${value}.PNG">`;
        }
        content += `</div><button class="dice-change">Change</button><br>`

        return content;
    }

    _selectDice(event) {
        event.preventDefault();

        if ($(event.currentTarget).hasClass("dice-select")) {
            $(event.currentTarget).removeClass("dice-select");

            if ($(event.currentTarget).hasClass("action"))
                this.action = null;
            else
                this.spirit = null;
            
            return;
        }

        $(event.currentTarget).parent().find(".dice-select").removeClass("dice-select");
        $(event.currentTarget).addClass("dice-select");
        if ($(event.currentTarget).hasClass("action"))
            this.action = event.currentTarget;
        else
            this.spirit = event.currentTarget;

    }

    _swapDice(event) {
        if (this.action != null && this.spirit != null) {
            let tmp = this.action.dataset.value;
            this.action.dataset.value = this.spirit.dataset.value;
            this.spirit.dataset.value = tmp;

            $(this.action).attr("src", `systems/kamigakari/assets/dice/${this.action.dataset.value}.PNG`);
            $(this.spirit).attr("src", `systems/kamigakari/assets/dice/${this.spirit.dataset.value}.PNG`);

            this.actionDice[this.action.dataset.index] = this.action.dataset.value;
            this.spiritDice[this.spirit.dataset.key] = Number(this.spirit.dataset.value);

            $(event.currentTarget).parent().find(".dice-select").removeClass("dice-select");

            this.action = null;
            this.spirit = null;
        }
    }

    async _submit() {
        for (let [key, value] of Object.entries(this.spiritDice))
            this.actor.update({[`data.attributes.spirit_dice.value.${key}`]: value});

        var formula = "";
        $(this.actionDice).each(element => {
            formula += this.actionDice[element] + "+";
        });
        formula += this.modScore;

        var roll = new Roll(formula);
        roll.roll();
        roll.render().then(r => {
            ChatMessage.create({content: r, speaker: ChatMessage.getSpeaker({actor: this.actor})});
        });
    }


}