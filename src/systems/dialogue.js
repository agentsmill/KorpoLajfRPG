import { openDialog, closeDialog, openChoice, showDice } from './ui.js';
import { DIALOG_TREES } from '../world/dialogs.js';

export function createDialogue(state) {
  let active = null; // { treeId, nodeId }

  function start(treeId, nodeId = 'start') {
    active = { treeId, nodeId };
    step();
  }

  function step() {
    if (!active) return;
    const tree = DIALOG_TREES[active.treeId];
    if (!tree) { end(); return; }
    const node = tree.nodes[active.nodeId];
    if (!node) { end(); return; }

    // Apply immediate effects if present
    if (node.effects) applyEffects(node.effects);

    // Skill check gate
    if (node.check) {
      const { skill, dc } = node.check;
      const result = rollSkill(skill, dc);
      // show dice modal, then continue
      showDice(state, {
        title: `Test: ${skill}`,
        roll: result.total,
        dc,
        mod: result.mod,
        success: () => {
          active.nodeId = result.ok ? node.check.success : node.check.failure;
          step();
        }
      });
      return;
    }
    // Secret auto-ending hook (stress>95 in CEO endings)
    if (active.treeId === 'ceo' && active.nodeId === 'ending_router' && (state.player.stress||0) > 95) {
      active.nodeId = 'stress_secret';
    }
    // Choices
    if (node.choices && node.choices.length) {
      const filtered = node.choices
        .filter(c => meetsReqs(c.requires, state))
        .filter(c => meetsFlagReqs(c.requiresFlags, state))
        .filter(c => meetsStressReqs(c.requiresStress, state))
        .filter(c => meetsItemReqs(c.requiresItems, state));
      openChoice(state, node.title || node.speaker || 'Wybór', node.text || '', filtered, (pick) => {
        const choice = node.choices.find(c => c.id === pick || c.label === pick) || node.choices[0];
        if (choice.effects) applyEffects(choice.effects);
        if (choice.next) {
          active.nodeId = choice.next;
          step();
        } else {
          end();
        }
      });
    } else {
      // Linear line, wait for E or tap on dialog/A button
      if (node.speaker || node.text) {
        const sub = subForSpeaker(state, node.speaker);
        openDialog(state, node.speaker || 'Narrator', node.text || '', sub);
      }
      if (node.next) {
        active.nextPlanned = node.next;
      } else {
        active.nextPlanned = null;
      }
    }
  }

  function consumeInteraction() {
    if (!active) return false;
    const tree = DIALOG_TREES[active.treeId];
    const node = tree?.nodes[active.nodeId];
    if (!node) { end(); return true; }
    if (node.choices && node.choices.length) {
      // choices are handled by buttons, ignore E
      return true;
    }
    if (active.nextPlanned) {
      active.nodeId = active.nextPlanned;
      closeDialog(state);
      step();
    } else {
      end();
    }
    return true;
  }

  function end() {
    closeDialog(state);
    state.ui.choiceModal?.classList.add('hidden');
    state.ui.overlay?.classList.add('hidden');
    active = null;
  }

  function isActive() { return !!active; }

  function applyEffects(eff) {
    if (!eff) return;
    if (eff.stress) state.player.stress = Math.max(0, state.player.stress + eff.stress);
    if (eff.rep) {
      state.rep = state.rep || { it: 0, hr: 0, mgmt: 0 };
      if (eff.rep.it) state.rep.it += eff.rep.it;
      if (eff.rep.hr) state.rep.hr += eff.rep.hr;
      if (eff.rep.mgmt) state.rep.mgmt += eff.rep.mgmt;
    }
    if (eff.jira) state.player.jira += eff.jira;
    if (eff.coffee) state.player.coffee += eff.coffee;
    if (eff.objective) {
      state.objective = eff.objective;
      state.objectives = state.objectives || [];
      state.objectives.unshift(eff.objective);
    }
    if (eff.addObjective) {
      state.objectives = state.objectives || [];
      state.objectives.push(eff.addObjective);
    }
    if (eff.completeObjective) {
      state.objectives = (state.objectives || []).filter(o => (o.id||o.label) !== (eff.completeObjective.id||eff.completeObjective.label));
    }
    if (eff.markQuest) state.quests?.mark?.(eff.markQuest);
    if (eff.notify) state.story?.notify?.(eff.notify);
    if (eff.setFlag) {
      state.flags = state.flags || {};
      Object.assign(state.flags, eff.setFlag);
    }
    if (eff.startQuest && state.questsEx?.start) state.questsEx.start(eff.startQuest);
    if (eff.advanceQuest && state.questsEx?.advance) state.questsEx.advance(eff.advanceQuest);
    if (eff.unlockFaction === 'admin') {
      state.flags = state.flags || {}; state.flags.admin_unlocked = true;
    }
    if (eff.giveItem) {
      const items = Array.isArray(eff.giveItem) ? eff.giveItem : [eff.giveItem];
      state.inventory = new Set([...(state.inventory || [])]);
      items.forEach(it => state.inventory.add(it));
      state.inventory = Array.from(state.inventory);
      state._updatePhoneUI?.();
    }
    if (eff.removeItem) {
      const items = Array.isArray(eff.removeItem) ? eff.removeItem : [eff.removeItem];
      state.inventory = new Set([...(state.inventory || [])]);
      items.forEach(it => state.inventory.delete(it));
      state.inventory = Array.from(state.inventory);
      state._updatePhoneUI?.();
    }
    if (eff.message) {
      state.inbox = state.inbox || [];
      const t = new Date();
      state.inbox.unshift({ from: eff.message.from || 'System', text: eff.message.text || String(eff.message), at: t.toISOString() });
      state._updatePhoneUI?.();
    }
  }

  function meetsReqs(req, state) {
    if (!req) return true;
    const rep = state.rep || { it: 0, hr: 0, mgmt: 0 };
    if (req.it && rep.it < req.it) return false;
    if (req.hr && rep.hr < req.hr) return false;
    if (req.mgmt && rep.mgmt < req.mgmt) return false;
    return true;
  }

  function meetsStressReqs(reqStress, state) {
    if (!reqStress) return true;
    const s = Math.round(state.player.stress || 0);
    if (typeof reqStress.min === 'number' && s < reqStress.min) return false;
    if (typeof reqStress.max === 'number' && s > reqStress.max) return false;
    return true;
  }

  function meetsItemReqs(reqItems, state) {
    if (!reqItems) return true;
    const inv = new Set(state.inventory || []);
    const items = Array.isArray(reqItems) ? reqItems : [reqItems];
    return items.every(it => inv.has(it));
  }

  // skill checks
  function rollSkill(skill, dc) {
    const map = { Empatia: state.skills?.emp || 0, Logika: state.skills?.log || 0, Retoryka: state.skills?.ret || 0, Grit: state.skills?.grit || 0 };
    const mod = (map[skill] ?? 0) - Math.floor((state.player.stress || 0) / 25);
    const die = 1 + Math.floor(Math.random() * 6);
    const total = die + mod;
    return { die, mod, total, ok: dc ? total >= dc : true };
  }

  function meetsFlagReqs(reqFlags, state) {
    if (!reqFlags) return true;
    const flags = state.flags || {};
    return Object.entries(reqFlags).every(([k,v]) => !!flags[k] === !!v);
  }

  return { start, consumeInteraction, isActive };
}

function subForSpeaker(state, name) {
  if (!name) return '';
  const id = Object.keys(state._npcMeta || {}).find(k => (state._npcMeta[k].name || '').startsWith(name));
  const m = id ? state._npcMeta[id] : null;
  if (!m) return '';
  const factionName = m.faction === 'it' ? 'IT' : m.faction === 'hr' ? 'HR' : m.faction === 'mgmt' ? 'Management' : m.faction === 'ops' ? 'Operacje' : '';
  return [factionName, m.bio].filter(Boolean).join(' • ');
}


