addLayer('hop', {
    row: 3,
    realm: 1,
    startData() { return {
        // Basic
        unlocked: true,          // DO NOT CHANGE
        done: false,             // DO NOT CHANGE
        points: new Decimal(0),  // Grasshoppers

        // Progression
        bestReset: new Decimal(0),  // Used for Rank
        coloTier: new Decimal(0),   // Stage
        leg: new Decimal(0),        // League

        // Colo Tools
        opp: new Decimal(10),    // Opponent HP
        active: new Decimal(0),  // Enlisted Grasshoppers
        enlistPortion: 100,      // Enlisting/Assignment Percentage
        coloTimer: 15,           // Time in seconds until next Combat Tick

        // Jobs
        lawns: new Decimal(0),   // Lawnmowers
        groves: new Decimal(0),  // Grovetenders
        crys: new Decimal(0),    // Crystallizers
        breed: new Decimal(0),   // Breeders
        armor: new Decimal(0),   // Armorers
        sacs: new Decimal(0),    // Sacrifices

        // Misc
        bestEnlist: new Decimal(0),    // Highest total Grasshoppers enlisted at once, used for Grasshopper healthbar
        autoIndoc: false,              // Whether or not Auto-Indoctrinate is active
        autoThresh: new Decimal(100),  // Requirement to Auto-Indoctrinate
        autoEnlistPortion: 0,
    }},
    update(diff) {
        player.hop.coloTimer -= diff;
        player.hop.coloTimer = Math.min(player.hop.coloTimer, tmp.hop.tickLength);

        if(player.hop.coloTimer < 0) { // Colosseum Tick
            player.hop.coloTimer = Math.max(0, player.hop.coloTimer+tmp.hop.tickLength);
            player.hop.opp = player.hop.opp.sub(player.hop.active.max(0).mul(tmp.hop.dmg.max(0))).ceil().min(tmp.hop.oppStats[0]);

            if(player.hop.opp.lte(0)) { // Colosseum Progression
                player.hop.coloTier = player.hop.coloTier.add(1);
                player.hop.opp = layers.hop.oppStats()[0];
            } else {
                player.hop.active = player.hop.active.sub(tmp.hop.oppStats[1].div(tmp.hop.arm.add(1).max(1)).max(0)).ceil().max(0);
            }
        }

        if(hasMilestone('leag', 2)) {
            player.hop.points = player.hop.points.add(player.hop.bestReset.div(10000).mul(Decimal.add(10, tmp.hop.clickables[24].effect)).mul(diff).mul(Decimal.sub(100, player.hop.autoEnlistPortion)));
            player.hop.active = player.hop.active.add(player.hop.bestReset.div(10000).mul(Decimal.add(10, tmp.hop.clickables[24].effect)).mul(diff).mul(player.hop.autoEnlistPortion));
            player.hop.bestEnlist = player.hop.bestEnlist.max(player.hop.active);
        }

        if(player.hop.active.lte(0.01)) {
            player.hop.bestEnlist = Decimal.dZero
        }
    },
    automate() {
        if(player.hop.autoIndoc && getResetGain('hop').gte(player.hop.autoThresh)) { doReset('hop') }
    },
    tickLength() {
        let length = 15;
        if(hasMilestone('hop', 2)) { length -= 7; }
        if(hasMilestone('leag', 1)) { length -= 4.5; }
        if(player.crys.flautomation.includes('14')) { length -= 2.5; }
        return length
    },
    color: 'var(--ghop)',
    layerShown() { return player.crys.done },
    image: 'resources/cult-icon.webp',
    nodeStyle: {
        'background-size': 'contain',
        'background-color': 'hsl(0, 0%, 27.5%)',
        'border-color': 'var(--ghop)',
    },
    type: 'normal',
    resource: 'Grasshoppers',
    gainMult() {
        let gain = tmp.field.level.sub(199).max(1).pow(0.25).pow_base(1.25);
        gain = gain.mul(player.field.points.max(1).log(10).pow(0.5).add(1));
        gain = gain.mul(tmp.hop.rank.pow_base(2.5));
        if(hasMilestone('hop', 1)) { gain = gain.mul(tmp.crys.milestones[4].effect[1]); }
        if(hasMilestone('hop', 7)) { gain = gain.mul(tmp.hop.milestones[7].effect); }
        if(hasMilestone('leag', 0)) { gain = gain.mul(tmp.leag.milestones[0].effect); }
        gain = gain.mul(tmp.forest.buyables[15].effect);
        return gain.max(5).floor();
    },
    baseResource: 'Levels',
    baseAmount() { return tmp.field.level },
    exponent() { return new Decimal(0) },
    requires: new Decimal(200),
    passiveGeneration() {
        let gain = Decimal.dZero;
        return gain;
    },
    prestigeButtonText() {
        return tmp.field.level.lt(200)?`Reach Level 200 to Indoctrinate`:`Indoctrinate ${formatWhole(getResetGain('hop'))} Grasshoppers<br><br>Indoctrinated Grasshoppers is boosted by Grass, Level and Rank`
    },
    tabFormat: {
        'Indoctrination': {
            content: [
                ['raw-html', function(){return `You have <h2  class="overlayThing" id="points" style="color: var(--ghop); text-shadow: var(--ghop) 0px 0px 10px;">${formatWhole(player.hop.points.max(0))}</h2> Grasshoppers`}],
                'blank',
                'prestige-button',
                ['raw-html', function(){return tmp.hop.passiveGeneration.gt(0)?`(${format(tmp.hop.passiveGeneration.mul(getResetGain('hop')))}/sec)`:''}],
                'blank',
                ['bar', 'level'],
                ['raw-html', function(){return player.hop.done?`x${format(tmp.hop.rankEffect)} Damage`:'First Indoctrination unlocks Rank and Combat'}],
                function(){return hasMilestone('hop', 6)?['column', ['blank', ['raw-html', 'Auto-Indoctrinate'], ['row', [['text-input', 'autoThresh'], 'blank', ['toggle', ['hop', 'autoIndoc']]]], 'blank']]:'blank'},
            ],
            color: 'var(--ghop)',
        },
        'Colosseum': {
            content: [
                ['raw-html', function(){return `You have <h2  class="overlayThing" id="points" style="color: var(--ghop); text-shadow: var(--ghop) 0px 0px 10px;">${formatWhole(player.hop.points.max(0))}</h2> Grasshoppers`}],
                ['raw-html', function(){return `You are Rank <h2  class="overlayThing" id="points" style="color: var(--rank); text-shadow: var(--rank) 0px 0px 10px;">${formatWhole(tmp.hop.rank.max(0))}</h2>`}],
                'blank',
                ['clickable', 11],
                ['raw-html', function(){return `Enlisting Percentage: ${formatWhole(player.hop.enlistPortion)}`}],
                ['slider', ['enlistPortion', 1, 100]],
                'blank',
                ['column', function(){return !hasMilestone('leag', 2)?['blank']:[['raw-html', `Auto-Enlist Percentage: ${formatWhole(player.hop.autoEnlistPortion)}`],
                ['slider', ['autoEnlistPortion', 0, 100]],
                'blank']}],
                ['raw-html', function(){return `Stage <h2  class="overlayThing" id="points" style="color: var(--rank); text-shadow: var(--rank) 0px 0px 10px;">${formatWhole(player.hop.coloTier.add(1).max(0))}</h2>`}],
                ['raw-html', function(){return `<div style="margin-bottom: 5px;">Combat Tick in ${formatTime(player.hop.coloTimer)}</div>`}],
                'colosseum',
                'colo-stats',
                'league',
                'blank',
            ],
            unlocked(){return player.hop.done},
            buttonStyle: {
                'background-color': 'var(--rank)',
                'border-color': 'var(--rank)',
            },
            color: 'var(--rank)',
        },
        'Stage Rewards': {
            content: [
                ['raw-html', function(){return `You are at Stage <h2  class="overlayThing" id="points" style="color: var(--rank); text-shadow: var(--rank) 0px 0px 10px;">${formatWhole(player.hop.coloTier.add(1).max(0))}</h2>`}],
                function(){return player.hop.leg.gte(1)?['raw-html', `<br>Stages are boosting:<br><div style="width: 250px; text-align: left;">Crystals, TP: x${formatWhole(player.hop.coloTier.add(2))}<br>Grass, EXP: x${format(tmp.hop.milestones[2].effect)}<br>HP: +${format(player.hop.coloTier.add(1).div(10))}<br>Grasshoppers: x${format(tmp.hop.milestones[7].effect)}</div><br><br>`]:'blank'},
                'milestones',
                'blank',
            ],
            unlocked(){return player.hop.done},
            buttonStyle: {
                'background-color': 'var(--rank)',
                'border-color': 'var(--rank)',
            },
            color: 'var(--rank)',
        },
        'Jobs': {
            content: [
                ['raw-html', function(){return `Assigning ${formatWhole(player.hop.enlistPortion)}%, ${formatWhole(player.hop.points.mul(player.hop.enlistPortion/100).floor())} grasshoppers`}],
                ['slider', ['enlistPortion', 1, 100]],
                'blank',
                ['row', [
                    ['column', [
                        ['raw-html', 'Basic Jobs'],
                        ['clickable', 21],
                        ['clickable', 22],
                        ['clickable', 25],
                    ]],
                    'blank',
                    ['column', [
                        ['raw-html', 'Passive Jobs'],
                        ['clickable', 23],
                        ['clickable', 24],
                    ]],
                ]]
            ],
            unlocked(){return hasMilestone('hop', 5)},
            buttonStyle: {
                'background-color': 'var(--ghop)',
                'border-color': 'var(--ghop)',
            },
            color: 'var(--ghop)',
        },
        'League': {
            content: [
                'league',
                ['layer-proxy', ['leag', [
                    'blank',
                    'milestones',
                ]]]
            ],
            unlocked(){return hasMilestone('hop', 8)},
            buttonStyle: {
                'background-color': 'var(--leag)',
                'border-color': 'var(--leag)',
            },
            color: 'var(--leag)',
        },
    },
    leagueRequirement() {
        return player.hop.leg.pow(1.6).mul(35).add(100).ceil();
    },
    bars: {
        level: {
            direction: RIGHT,
            width: 550,
            height: 70,
            progress() { return player.hop.bestReset.div(tmp.hop.forRank) },
            display() {
                return `Rank <h2 class="overlayThing" id="points" style="color: var(--rank); text-shadow: var(--rank) 0px 0px 10px, black 0px 0px 5px, black 0px 0px 5px, black 0px 0px 5px;">${formatWhole(tmp.hop.rank.max(0))}</h2><br>
                ${formatWhole(player.hop.bestReset)}/${formatWhole(tmp.hop.forRank)} Best GH Gained` + (getResetGain('hop').gt(player.hop.bestReset)?`<br>(${formatWhole(getResetGain('hop').sub(player.hop.bestReset))}/reset)`:'')
            },
            fillStyle: { 'background-color': 'var(--rank)', },
            unlocked(){return player.hop.done},
        },
        level2: {
            direction: RIGHT,
            width: 550,
            height: 70,
            progress() { return player.hop.sacs.div(tmp.hop.sacForRank) },
            display() {
                return `Sacrifice Rank <h2 class="overlayThing" id="points" style="color: var(--rank); text-shadow: var(--rank) 0px 0px 10px, black 0px 0px 5px, black 0px 0px 5px, black 0px 0px 5px;">${formatWhole(tmp.hop.sacRank.max(0))}</h2><br>
                ${formatWhole(player.hop.sacs)}/${formatWhole(tmp.hop.sacForRank)} Sacrificed Grasshoppers<br>(${formatWhole(player.hop.points.mul(player.hop.enlistPortion).div(100))}/sac)`
            },
            fillStyle: { 'background-image': 'url(resources/blood.webp)' },
            unlocked(){return tmp.forest.tabFormat.Cabin.unlocked},
        },
        level2small: {
            direction: RIGHT,
            width: 300,
            height: 10,
            progress() { return player.hop.sacs.div(tmp.hop.sacForRank) },
            fillStyle: { 'background-image': 'url(resources/blood.webp)' },
            unlocked(){return player.hop.done},
            borderStyle: { 'border-width': '2px', 'margin-top': '3px', },
        },
        enlisted: {
            direction: RIGHT,
            width: 300,
            height: 10,
            progress() { return player.hop.active.lte(0.01)?Decimal.dZero:player.hop.active.div(player.hop.bestEnlist) },
            fillStyle: { 'background-color': 'var(--ghop)', },
            unlocked(){return player.hop.done},
            borderStyle: { 'border-width': '2px', 'margin-top': '3px', },
        },
        oppHP: {
            direction: RIGHT,
            width: 300,
            height: 10,
            progress() { return player.hop.opp.div(tmp.hop.oppStats[0]) },
            fillStyle: { 'background-color': 'var(--rank)', },
            unlocked(){return player.hop.done},
            borderStyle: { 'border-width': '2px', 'margin-top': '3px', },
        },
        league: {
            direction: RIGHT,
            width: 300,
            height: 10,
            progress() { return player.hop.coloTier.add(1).div(tmp.hop.leagueRequirement) },
            fillStyle: { 'background-image': 'url(resources/stars.webp)', },
            unlocked(){return player.hop.done},
            borderStyle: { 'border-width': '2px', 'margin-top': '3px' },
        },
        bigLeague: {
            direction: RIGHT,
            width: 550,
            height: 70,
            progress() { return player.hop.coloTier.div(tmp.hop.leagueRequirement) },
            display() {
                return `League <h2 style="color: var(--leag); text-shadow: var(--leag) 0px 0px 10px, black 0px 0px 5px, black 0px 0px 5px, black 0px 0px 5px;">${formatWhole(player.hop.leg.add(1).max(0))}</h2><br>
                Stage ${formatWhole(player.hop.coloTier.add(1))}/${formatWhole(tmp.hop.leagueRequirement)}`
            },
            fillStyle: {  'background-image': 'url(resources/stars.webp)', },
            unlocked(){return hasMilestone('hop', 8)},
        },
    },
    clickables: {
        11: {
            title: 'Enlist Grasshoppers',
            display() {
                return `Enlists ${formatWhole(player.hop.enlistPortion)}%, ${formatWhole(player.hop.points.mul(player.hop.enlistPortion/100).floor())} Grasshoppers`
            },
            canClick() { return player.hop.points.gte(1) },
            onClick() {
                player.hop.active = player.hop.active.add(player.hop.points.mul(player.hop.enlistPortion/100)).floor();
                player.hop.points = player.hop.points.mul(Decimal.sub(1, player.hop.enlistPortion/100)).ceil();
                player.hop.bestEnlist = player.hop.bestEnlist.max(player.hop.active);
            },
            style: {
                width: '250px',
                height: '50px',
                'min-height': '60px',
            },
        },
        21: {
            title: 'Assign Lawnmowers',
            display() {
                return `You have ${formatWhole(player.hop.lawns)}, which boosts<br>autocut by +${format(tmp.hop.clickables[21].effect)}`
            },
            canClick() { return player.hop.points.gte(1) },
            onClick() {
                player.hop.lawns = player.hop.lawns.add(player.hop.points.mul(player.hop.enlistPortion/100)).floor();
                player.hop.points = player.hop.points.mul(Decimal.sub(1, player.hop.enlistPortion/100)).ceil();
            },
            style: {
                width: '250px',
                height: '60px',
                'min-height': '60px',
            },
            effect() {
                return player.hop.lawns.max(0).pow(0.5);
            },
        },
        22: {
            title: 'Assign Grovetenders',
            display() {
                return `You have ${formatWhole(player.hop.groves)}, which boosts<br>flowers by x${format(tmp.hop.clickables[22].effect)} and grass by x${format(tmp.hop.clickables[22].effect.pow(3))}`
            },
            canClick() { return player.hop.points.gte(1) },
            onClick() {
                player.hop.groves = player.hop.groves.add(player.hop.points.mul(player.hop.enlistPortion/100)).floor();
                player.hop.points = player.hop.points.mul(Decimal.sub(1, player.hop.enlistPortion/100)).ceil();
            },
            style: {
                width: '250px',
                height: '60px',
                'min-height': '60px',
            },
            effect() {
                return player.hop.groves.max(0).pow(0.25).add(1);
            },
        },
        23: {
            title: 'Assign Crystallizers',
            display() {
                return `You have ${formatWhole(player.hop.crys)}, which boosts<br>passive crystals by +${format(tmp.hop.clickables[23].effect)}%`
            },
            canClick() { return player.hop.points.gte(1) },
            onClick() {
                player.hop.crys = player.hop.crys.add(player.hop.points.mul(player.hop.enlistPortion/100)).floor();
                player.hop.points = player.hop.points.mul(Decimal.sub(1, player.hop.enlistPortion/100)).ceil();
            },
            style: {
                width: '250px',
                height: '60px',
                'min-height': '60px',
            },
            effect() {
                return player.hop.crys.max(0).pow(0.75);
            },
            unlocked(){return player.crys.flautomation.includes('41')}
        },
        24: {
            title: 'Assign Breeders',
            display() {
                return `You have ${formatWhole(player.hop.breed)}, which boosts<br>passive grasshoppers by +${format(tmp.hop.clickables[24].effect)}%`
            },
            canClick() { return player.hop.points.gte(1) },
            onClick() {
                player.hop.breed = player.hop.breed.add(player.hop.points.mul(player.hop.enlistPortion/100)).floor();
                player.hop.points = player.hop.points.mul(Decimal.sub(1, player.hop.enlistPortion/100)).ceil();
            },
            style: {
                width: '250px',
                height: '60px',
                'min-height': '60px',
            },
            effect() {
                return player.hop.breed.max(1).log(15).pow(2).mul(25);
            },
            unlocked(){return hasMilestone('leag', 2)}
        },
        25: {
            title: 'Assign Armorers',
            display() {
                return `You have ${formatWhole(player.hop.armor)}, which boosts<br>HP x${format(tmp.hop.clickables[25].effect)}`
            },
            canClick() { return player.hop.points.gte(1) },
            onClick() {
                player.hop.armor = player.hop.armor.add(player.hop.points.mul(player.hop.enlistPortion/100)).floor();
                player.hop.points = player.hop.points.mul(Decimal.sub(1, player.hop.enlistPortion/100)).ceil();
            },
            style: {
                width: '250px',
                height: '60px',
                'min-height': '60px',
            },
            effect() {
                return player.hop.armor.div(1e6).max(1).log(10).pow(2).mul(0.3).add(1);
            },
            unlocked(){return hasMilestone('hop', 9)}
        },
    },
    milestones: {
        0: {
            requirementDescription: 'Stage 4',
            effectDescription() { return `Every stage increases crystals gain by +100%<br>Currently: x${formatWhole(tmp[this.layer].milestones[this.id].effect)}` },
            effect() { return player.hop.coloTier.add(2) },
            done() { return player.hop.coloTier.gte(3) },
            style: { 'width': '500px', 'border-width': '0', 'box-shadow': 'inset 0 0 0 4px rgba(0,0,0,0.125)' },
            hidden() { return player.hop.leg.gte(1); },
        },
        1: {
            requirementDescription: 'Stage 10',
            effectDescription() { return `Every stage increases TP gain by +100%<br>Also unlocks an accomplishment | Currently: x${formatWhole(tmp[this.layer].milestones[this.id].effect)}` },
            effect() { return player.hop.coloTier.add(2) },
            done() { return player.hop.coloTier.gte(9) },
            style: { 'width': '500px', 'border-width': '0', 'box-shadow': 'inset 0 0 0 4px rgba(0,0,0,0.125)' },
            hidden() { return player.hop.leg.gte(1); },
        },
        2: {
            requirementDescription: 'Stage 20',
            effectDescription() { return `Every stage increases grass gain by +20% compounding<br>Also reduces Combat Tick time to 8s | Currently: x${format(tmp[this.layer].milestones[this.id].effect)}` },
            effect() { return player.hop.coloTier.add(1).pow_base(1.2) },
            done() { return player.hop.coloTier.gte(19) },
            unlocked() { return hasMilestone(this.layer, this.id-2) },
            style: { 'width': '500px', 'border-width': '0', 'box-shadow': 'inset 0 0 0 4px rgba(0,0,0,0.125)' },
            hidden() { return player.hop.leg.gte(1); },
        },
        3: {
            requirementDescription: 'Stage 27',
            effectDescription() { return `Every stage increases experience gain by +20% compounding<br>Currently: x${format(tmp[this.layer].milestones[this.id].effect)}` },
            effect() { return player.hop.coloTier.add(1).pow_base(1.2) },
            done() { return player.hop.coloTier.gte(26) },
            unlocked() { return hasMilestone(this.layer, this.id-2) },
            style: { 'width': '500px', 'border-width': '0', 'box-shadow': 'inset 0 0 0 4px rgba(0,0,0,0.125)' },
            hidden() { return player.hop.leg.gte(1); },
        },
        4: {
            requirementDescription: 'Stage 35',
            effectDescription() { return `Every stage increases grasshoppers' HP by +0.1<br>Currently: +${format(tmp[this.layer].milestones[this.id].effect)}` },
            effect() { return player.hop.coloTier.add(1).div(10) },
            done() { return player.hop.coloTier.gte(34) },
            unlocked() { return hasMilestone(this.layer, this.id-2) },
            style: { 'width': '500px', 'border-width': '0', 'box-shadow': 'inset 0 0 0 4px rgba(0,0,0,0.125)' },
            hidden() { return player.hop.leg.gte(1); },
        },
        5: {
            requirementDescription: 'Stage 50',
            effectDescription() { return `Unlock Jobs` },
            done() { return player.hop.coloTier.gte(49) },
            unlocked() { return hasMilestone(this.layer, this.id-2) },
            style: { 'width': '500px', 'border-width': '0', 'box-shadow': 'inset 0 0 0 4px rgba(0,0,0,0.125)' },
            hidden() { return player.hop.leg.gte(1); },
        },
        6: {
            requirementDescription: 'Stage 70',
            effectDescription() { return `Unlock another accomplishment and Auto-Indoctrinate` },
            done() { return player.hop.coloTier.gte(69) },
            unlocked() { return hasMilestone(this.layer, this.id-2) },
            style: { 'width': '500px', 'border-width': '0', 'box-shadow': 'inset 0 0 0 4px rgba(0,0,0,0.125)' },
            hidden() { return player.hop.leg.gte(1); },
        },
        7: {
            requirementDescription: 'Stage 85',
            effectDescription() { return `Every stage above 50 increases grasshoppers gain by +5%<br>Currently: x${format(tmp[this.layer].milestones[this.id].effect)}` },
            effect() { return player.hop.coloTier.sub(29).div(20).max(1) },
            done() { return player.hop.coloTier.gte(84) },
            unlocked() { return hasMilestone(this.layer, this.id-2) },
            style: { 'width': '500px', 'border-width': '0', 'box-shadow': 'inset 0 0 0 4px rgba(0,0,0,0.125)' },
            hidden() { return player.hop.leg.gte(1); },
        },
        8: {
            requirementDescription: 'Stage 95',
            effectDescription() { return `Unlock Leagues` },
            done() { return player.hop.coloTier.gte(94) },
            unlocked() { return hasMilestone(this.layer, this.id-2) },
            style: { 'width': '500px', 'border-width': '0', 'box-shadow': 'inset 0 0 0 4px rgba(0,0,0,0.125)' },
            hidden() { return false; },
        },
        9: {
            requirementDescription: 'Stage 125',
            effectDescription() { return `Unlock another job` },
            done() { return player.hop.coloTier.gte(124) },
            unlocked() { return hasMilestone(this.layer, this.id-2) },
            style: { 'width': '500px', 'border-width': '0', 'box-shadow': 'inset 0 0 0 4px rgba(0,0,0,0.125)' },
            hidden() { return false; },
        },
    },
    tooltip() { return `<h2>THE CULT</h2><br>${formatWhole(player.hop.points)} GH<br>Rank ${formatWhole(tmp.hop.rank)}` },
    doReset(layer) {
        if(tmp[layer].row <= tmp[this.layer].row) { return }
        if(tmp[layer].realm != tmp[this.layer].realm && tmp[layer].realm != 0) { return }
        layerDataReset(this.layer, ['done'])
    },
    onPrestige(gain) {
        player.hop.done = true
        player.hop.bestReset = player.hop.bestReset.max(gain)
    },
    rank() { return player.hop.bestReset.floor().div(10).max(0).add(1).log(1.5).pow(4/7).floor() },
    forRank(x = tmp.hop.rank) { return x.add(1).pow(7/4).pow_base(1.5).sub(1).mul(10).ceil() },
    rankEffect() { return tmp.hop.rank.pow(0.66).pow_base(2) },
    sacRank() { return player.hop.sacs.floor().div(10).max(0).add(1).log(1.5).pow(4/5).floor() },
    sacForRank(x = tmp.hop.sacRank) { return x.add(1).pow(5/4).pow_base(1.5).sub(1).mul(10).ceil() },
    sacRankEffect() { return tmp.hop.sacRank.pow(0.66).pow_base(1.15) },
    branches: ['crys'],
    insects: ['Amoeba', 'Ant', 'Flower', 'Worm', 'Aphid', 'Beetle', 'Mantis', 'Butterfly', 'Bee', 'Wasp', 'Chair', 'Sparrow', 'Duck', 'Pigeon', 'Frog', 'Kitten', 'Dog', 'Horse', 'Eagle', 'Elephant', 'Hippo', 'Rhino', 'Human', 'Tank', 'Shark', 'Soldier', 'T-Rex', 'Cultist', 'Megalodon', 'Army'],
    insectMods: ['Weak', 'Common', 'Average', 'Cool', 'Adept', 'Strong', 'Toasted', 'Buff', 'Veteran', 'Psycho', 'Crystal', 'Powered', 'Master', 'Gifted', 'Magic', 'Legend', 'Ultra', 'Demonic', 'Hyper', 'Heavenly', 'Giga', 'Godly', 'Omega', 'Aleph', 'Omni', 'God of'],
    insectModsPlusPlusPlus: ['+', '++', '+++'],
    opponentName() {
        const insect = this.insects[player.hop.coloTier.mod(this.insects.length).toNumber()]
        let prefix = this.insectMods[player.hop.coloTier.div(this.insects.length).mod(this.insectMods.length).floor().toNumber()]
        if(player.hop.coloTier.gte(Decimal.mul(this.insects.length, this.insectMods.length).mul(4))) {
            insect = insect + '+' + formatWhole(player.hop.coloTier.div(this.insects.length).div(this.insectMods.length).floor())
        } else if(player.hop.coloTier.gte(Decimal.mul(this.insects.length, this.insectMods.length))) {
            insect = insect + this.insectModsPlusPlusPlus[player.hop.coloTier.div(this.insects.length).div(this.insectMods.length).sub(1).floor().toNumber()]
        }
        return prefix + ' ' + insect
    },
    oppStats() {
        let dmg = player.hop.coloTier.pow_base(1.1).mul(player.hop.coloTier.pow(0.5)).floor();
        if(player.hop.coloTier.gte(85)) {
            dmg = dmg.mul(player.hop.coloTier.sub(75).div(35).pow_base(15))
        }
        if(player.hop.coloTier.gte(100)) {
            dmg = dmg.mul(player.hop.coloTier.sub(100).div(250).min(2).pow_base(100))
        }
        if(player.hop.coloTier.gte(130)) {
            dmg = dmg.mul(player.hop.coloTier.sub(130).div(50).min(1).pow_base(5))
        }
        return [
            player.hop.coloTier.pow_base(1.2).mul(10).floor(),
            dmg,
        ];
    },
    highestOneShot() {
        const plrDmg = player.hop.active.mul(tmp.hop.dmg);
        return plrDmg.max(1).div(10).log(1.2).max(0).floor();
    },
    dmg() {
        let dmg = Decimal.dOne;
        dmg = dmg.mul(tmp.hop.rankEffect);
        if(hasMilestone('hop', 1)) { dmg = dmg.mul(tmp.crys.milestones[4].effect[0]); }
        if(hasMilestone('hop', 6)) { dmg = dmg.mul(tmp.crys.milestones[5].effect[0]); }
        if(hasMilestone('leag', 0)) { dmg = dmg.mul(tmp.leag.milestones[0].effect); }
        return dmg.floor();
    },
    arm() {
        let dmg = Decimal.dOne;
        if(hasMilestone('hop', 4)) { dmg = dmg.add(milestoneEffect('hop', 4)); }
        if(hasMilestone('hop', 6)) { dmg = dmg.mul(tmp.crys.milestones[5].effect[1]); }
        if(hasMilestone('leag', 0)) { dmg = dmg.mul(tmp.leag.milestones[0].effect); }
        if(hasMilestone('hop', 9)) { dmg = dmg.mul(tmp.hop.clickables[25].effect); }
        dmg = dmg.mul(tmp.hop.sacRankEffect);
        return dmg.sub(1);
    },
})

addLayer('leag', {
    row: 3, realm: 1, startData() { return { unlocked: true, points: new Decimal(0), }}, color: 'var(--leag)', type: 'none', resource: 'League',
    milestones: {
        0: {
            requirementDescription: 'League 2',
            effectDescription() { return `Every league starting at 2 doubles DMG, HP, and Grasshoppers<br>Currently: x${formatWhole(tmp[this.layer].milestones[this.id].effect)}` },
            effect() { return player.hop.leg.pow_base(2) },
            done() { return player.hop.leg.gte(1) },
            style: { 'width': '500px', 'border-width': '0', 'box-shadow': 'inset 0 0 0 4px rgba(0,0,0,0.125)' },
        },
        1: {
            requirementDescription: 'League 2, Stage 25',
            effectDescription() { return `Reduce Combat Tick time to 3.5s` },
            done() { return player.hop.leg.gte(1) && player.hop.coloTier.gte(24) },
            style: { 'width': '500px', 'border-width': '0', 'box-shadow': 'inset 0 0 0 4px rgba(0,0,0,0.125)' },
        },
        2: {
            requirementDescription: 'League 2, Stage 100',
            effectDescription() { return `Automatically gain 10% of your best Indoctrination reset per second, and unlock Auto-Enlist and another job` },
            done() { return player.hop.leg.gte(1) && player.hop.coloTier.gte(99) },
            style: { 'width': '500px', 'border-width': '0', 'box-shadow': 'inset 0 0 0 4px rgba(0,0,0,0.125)' },
        },
        3: {
            requirementDescription: 'League 3',
            effectDescription() { return `Unlock The Forest` },
            done() { return player.hop.leg.gte(2) },
            style: { 'width': '500px', 'border-width': '0', 'box-shadow': 'inset 0 0 0 4px rgba(0,0,0,0.125)' },
        },
    },
    doReset(layer) {
        if(tmp[layer].row <= tmp[this.layer].row) { return }
        if(tmp[layer].realm != tmp[this.layer].realm && tmp[layer].realm != 0) { return }
        layerDataReset(this.layer)
    },
    clickables: {
        11: {
            title: 'Complete League',
            display() {
                return `This resets Stage, and "refunds" all enlisted grasshoppers<br><br>You keep all Stage Rewards unlocked`
            },
            canClick() { return player.hop.coloTier.gte(tmp.hop.leagueRequirement) },
            onClick() {
                player.hop.points = player.hop.points.add(player.hop.active);
                player.hop.active = Decimal.dZero;
                player.hop.coloTier = new Decimal(0);
                player.hop.opp = new Decimal(10);
                player.hop.coloTimer = tmp.hop.tickLength;
                player.hop.leg = player.hop.leg.add(1);
            },
            style: {
                width: '300px',
                height: '50px',
                'min-height': '80px',
            },
            bgCol: 'hsl(270, 70%, 65%)'
        },
        12: {
            title: 'Sacrifice Grasshoppers',
            display() {
                return `This will sacrifice ${formatWhole(player.hop.enlistPortion)}%, ${formatWhole(player.hop.points.mul(player.hop.enlistPortion).div(100))} grasshoppers to Grassthulhu`
            },
            canClick() { return player.hop.points.gte(1) },
            onClick() {
                player.hop.sacs = player.hop.sacs.add(player.hop.points.mul(player.hop.enlistPortion).div(100));
                player.hop.points = player.hop.points.mul(Decimal.sub(100, player.hop.enlistPortion)).div(100);
            },
            style: {
                width: '300px',
                height: '50px',
                'min-height': '80px',
            },
            bgCol: 'var(--rank)'
        },
    },
    leagues: ['Dirt', 'Wooden', 'Stone', 'Tin', 'Copper', 'Iron', 'Titanium', 'Bronze', 'Silver', 'Gold', 'Platinum', 'Topaz', 'Amethyst', 'Emerald', 'Sapphire', 'Amber', 'Ruby', 'Diamond', 'Alpha', 'Beta', "Gamma", 'Omega', 'Final'],
    leagueName() {
        return this.leagues[player.hop.leg.floor().min(this.leagues.length).toNumber()]
    },
})