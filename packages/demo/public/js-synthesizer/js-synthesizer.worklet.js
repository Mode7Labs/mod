/*!
js-synthesizer version 1.11.0

@license

Copyright (C) 2025 jet
All rights reserved.

Redistribution and use in source and binary forms, with or without modification,
are permitted provided that the following conditions are met:

  1. Redistributions of source code must retain the above copyright notice,
     this list of conditions and the following disclaimer.
  2. Redistributions in binary form must reproduce the above copyright notice,
     this list of conditions and the following disclaimer in the documentation
     and/or other materials provided with the distribution.
  3. The name of the author may not be used to endorse or promote products derived
     from this software without specific prior written permission.

THIS SOFTWARE IS PROVIDED BY THE AUTHOR ``AS IS'' AND ANY EXPRESS OR IMPLIED WARRANTIES,
INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR
A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY
DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING,
BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA,
OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY,
WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE)
ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY
OF SUCH DAMAGE.
 */

/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/*!***********************************************!*\
  !*** ./src/main/workletEntry.ts + 13 modules ***!
  \***********************************************/

;// ./src/main/PointerType.ts
const INVALID_POINTER = 0;

;// ./src/main/WasmManager.ts
// @internal
let _module;
// @internal
let _addFunction;
// @internal
let _removeFunction;
// @internal
let _fs;
let _addOnPostRunFn;
// @internal
let fluid_settings_setint;
// @internal
let fluid_settings_setnum;
// @internal
let fluid_settings_setstr;
// @internal
let fluid_synth_error;
// @internal
let fluid_synth_sfload;
// @internal
let fluid_sequencer_register_client;
// @internal
let malloc;
// @internal
let free;
// @internal
let defaultMIDIEventCallback;
// @internal
function bindFunctions(module) {
    if (module == null && fluid_synth_error) {
        // (already bound)
        return;
    }
    if (module != null) {
        if (!module.addFunction || !module.removeFunction || !module.addOnPostRun) {
            throw new Error("Invalid 'module' object. libfluidsynth-*.js (2.4.6 or higher) must be used.");
        }
        _module = module;
        _addFunction = _module.addFunction;
        _removeFunction = _module.removeFunction;
        _addOnPostRunFn = _module.addOnPostRun;
    }
    else if (typeof AudioWorkletGlobalScope !== "undefined") {
        _module = AudioWorkletGlobalScope.wasmModule;
        _addFunction = _module.addFunction || AudioWorkletGlobalScope.wasmAddFunction;
        _removeFunction = _module.removeFunction || AudioWorkletGlobalScope.wasmRemoveFunction;
        _addOnPostRunFn = _module.addOnPostRun || AudioWorkletGlobalScope.addOnPostRun;
    }
    else if (typeof Module !== "undefined") {
        _module = Module;
        if (_module.addFunction) {
            _addFunction = _module.addFunction;
            _removeFunction = _module.removeFunction;
        }
        else {
            _addFunction = addFunction;
            _removeFunction = removeFunction;
        }
        if (_module.addOnPostRun) {
            _addOnPostRunFn = _module.addOnPostRun;
        }
        else {
            _addOnPostRunFn = typeof addOnPostRun !== "undefined" ? addOnPostRun : undefined;
        }
    }
    else {
        throw new Error("wasm module is not available. libfluidsynth-*.js must be loaded.");
    }
    _fs = _module.FS;
    // wrapper to use String type
    fluid_settings_setint = _module.cwrap("fluid_settings_setint", "number", [
        "number",
        "string",
        "number",
    ]);
    fluid_settings_setnum = _module.cwrap("fluid_settings_setnum", "number", [
        "number",
        "string",
        "number",
    ]);
    fluid_settings_setstr = _module.cwrap("fluid_settings_setstr", "number", [
        "number",
        "string",
        "string",
    ]);
    fluid_synth_error = _module.cwrap("fluid_synth_error", "string", [
        "number",
    ]);
    fluid_synth_sfload = _module.cwrap("fluid_synth_sfload", "number", [
        "number",
        "string",
        "number",
    ]);
    fluid_sequencer_register_client = _module.cwrap("fluid_sequencer_register_client", "number", ["number", "string", "number", "number"]);
    malloc = _module._malloc.bind(_module);
    free = _module._free.bind(_module);
    defaultMIDIEventCallback =
        _module._fluid_synth_handle_midi_event.bind(_module);
}
let promiseWaitForInitialized;
// @internal
function waitForInitialized() {
    if (promiseWaitForInitialized) {
        return promiseWaitForInitialized;
    }
    try {
        bindFunctions();
    }
    catch (e) {
        return Promise.reject(e);
    }
    if (_module.calledRun) {
        promiseWaitForInitialized = Promise.resolve();
        return promiseWaitForInitialized;
    }
    if (typeof _addOnPostRunFn === 'undefined') {
        promiseWaitForInitialized = new Promise((resolve) => {
            const fn = _module.onRuntimeInitialized;
            _module.onRuntimeInitialized = () => {
                resolve();
                if (fn) {
                    fn();
                }
            };
        });
    }
    else {
        promiseWaitForInitialized = new Promise((resolve) => {
            _addOnPostRunFn(resolve);
        });
    }
    return promiseWaitForInitialized;
}

;// ./src/main/MIDIEvent.ts
/** @internal */
class MIDIEvent {
    /** @internal */
    constructor(_ptr, _module) {
        this._ptr = _ptr;
        this._module = _module;
    }
    getType() {
        return this._module._fluid_midi_event_get_type(this._ptr);
    }
    setType(value) {
        this._module._fluid_midi_event_set_type(this._ptr, value);
    }
    getChannel() {
        return this._module._fluid_midi_event_get_channel(this._ptr);
    }
    setChannel(value) {
        this._module._fluid_midi_event_set_channel(this._ptr, value);
    }
    getKey() {
        return this._module._fluid_midi_event_get_key(this._ptr);
    }
    setKey(value) {
        this._module._fluid_midi_event_set_key(this._ptr, value);
    }
    getVelocity() {
        return this._module._fluid_midi_event_get_velocity(this._ptr);
    }
    setVelocity(value) {
        this._module._fluid_midi_event_set_velocity(this._ptr, value);
    }
    getControl() {
        return this._module._fluid_midi_event_get_control(this._ptr);
    }
    setControl(value) {
        this._module._fluid_midi_event_set_control(this._ptr, value);
    }
    getValue() {
        return this._module._fluid_midi_event_get_value(this._ptr);
    }
    setValue(value) {
        this._module._fluid_midi_event_set_value(this._ptr, value);
    }
    getProgram() {
        return this._module._fluid_midi_event_get_program(this._ptr);
    }
    setProgram(value) {
        this._module._fluid_midi_event_set_program(this._ptr, value);
    }
    getPitch() {
        return this._module._fluid_midi_event_get_pitch(this._ptr);
    }
    setPitch(value) {
        this._module._fluid_midi_event_set_pitch(this._ptr, value);
    }
    setSysEx(data) {
        const size = data.byteLength;
        const ptr = this._module._malloc(size);
        const ptrView = new Uint8Array(this._module.HEAPU8.buffer, ptr, size);
        ptrView.set(data);
        this._module._fluid_midi_event_set_sysex(this._ptr, ptr, size, 1);
    }
    setText(data) {
        const size = data.byteLength;
        const ptr = this._module._malloc(size);
        const ptrView = new Uint8Array(this._module.HEAPU8.buffer, ptr, size);
        ptrView.set(data);
        this._module._fluid_midi_event_set_text(this._ptr, ptr, size, 1);
    }
    setLyrics(data) {
        const size = data.byteLength;
        const ptr = this._module._malloc(size);
        const ptrView = new Uint8Array(this._module.HEAPU8.buffer, ptr, size);
        ptrView.set(data);
        this._module._fluid_midi_event_set_lyrics(this._ptr, ptr, size, 1);
    }
}

;// ./src/main/SequencerEventData.ts

/** @internal */
class SequencerEventData {
    /** @internal */
    constructor(_ptr, _module) {
        this._ptr = _ptr;
        this._module = _module;
    }
    /** @internal */
    getRaw() {
        return this._ptr;
    }
    /** @internal */
    dispose() {
        this._ptr = INVALID_POINTER;
    }
    getType() {
        if (this._ptr === INVALID_POINTER)
            return -1;
        return this._module._fluid_event_get_type(this._ptr);
    }
    getSource() {
        if (this._ptr === INVALID_POINTER)
            return -1;
        return this._module._fluid_event_get_source(this._ptr);
    }
    getDest() {
        if (this._ptr === INVALID_POINTER)
            return -1;
        return this._module._fluid_event_get_dest(this._ptr);
    }
    getChannel() {
        if (this._ptr === INVALID_POINTER)
            return -1;
        return this._module._fluid_event_get_channel(this._ptr);
    }
    getKey() {
        if (this._ptr === INVALID_POINTER)
            return -1;
        return this._module._fluid_event_get_key(this._ptr);
    }
    getVelocity() {
        if (this._ptr === INVALID_POINTER)
            return -1;
        return this._module._fluid_event_get_velocity(this._ptr);
    }
    getControl() {
        if (this._ptr === INVALID_POINTER)
            return -1;
        return this._module._fluid_event_get_control(this._ptr);
    }
    getValue() {
        if (this._ptr === INVALID_POINTER)
            return -1;
        return this._module._fluid_event_get_value(this._ptr);
    }
    getProgram() {
        if (this._ptr === INVALID_POINTER)
            return -1;
        return this._module._fluid_event_get_program(this._ptr);
    }
    getData() {
        if (this._ptr === INVALID_POINTER)
            return -1;
        return this._module._fluid_event_get_data(this._ptr);
    }
    getDuration() {
        if (this._ptr === INVALID_POINTER)
            return -1;
        return this._module._fluid_event_get_duration(this._ptr);
    }
    getBank() {
        if (this._ptr === INVALID_POINTER)
            return -1;
        return this._module._fluid_event_get_bank(this._ptr);
    }
    getPitch() {
        if (this._ptr === INVALID_POINTER)
            return -1;
        return this._module._fluid_event_get_pitch(this._ptr);
    }
    getSFontId() {
        if (this._ptr === INVALID_POINTER)
            return -1;
        return this._module._fluid_event_get_sfont_id(this._ptr);
    }
}

;// ./src/main/ISequencerEventData.ts

/** @internal */

/** @internal */

/** @internal */
function rewriteEventDataImpl(ev, event) {
    switch (event.type) {
        case 0 /* Note */:
        case 'note':
            _module._fluid_event_note(ev, event.channel, event.key, event.vel, event.duration);
            break;
        case 1 /* NoteOn */:
        case 'noteon':
        case 'note-on':
            _module._fluid_event_noteon(ev, event.channel, event.key, event.vel);
            break;
        case 2 /* NoteOff */:
        case 'noteoff':
        case 'note-off':
            _module._fluid_event_noteoff(ev, event.channel, event.key);
            break;
        case 3 /* AllSoundsOff */:
        case 'allsoundsoff':
        case 'all-sounds-off':
            _module._fluid_event_all_sounds_off(ev, event.channel);
            break;
        case 4 /* AllNotesOff */:
        case 'allnotesoff':
        case 'all-notes-off':
            _module._fluid_event_all_notes_off(ev, event.channel);
            break;
        case 5 /* BankSelect */:
        case 'bankselect':
        case 'bank-select':
            _module._fluid_event_bank_select(ev, event.channel, event.bank);
            break;
        case 6 /* ProgramChange */:
        case 'programchange':
        case 'program-change':
            _module._fluid_event_program_change(ev, event.channel, event.preset);
            break;
        case 7 /* ProgramSelect */:
        case 'programselect':
        case 'program-select':
            _module._fluid_event_program_select(ev, event.channel, event.sfontId, event.bank, event.preset);
            break;
        case 12 /* ControlChange */:
        case 'controlchange':
        case 'control-change':
            _module._fluid_event_control_change(ev, event.channel, event.control, event.value);
            break;
        case 8 /* PitchBend */:
        case 'pitchbend':
        case 'pitch-bend':
            _module._fluid_event_pitch_bend(ev, event.channel, event.value);
            break;
        case 9 /* PitchWheelSensitivity */:
        case 'pitchwheelsens':
        case 'pitchwheelsensitivity':
        case 'pitch-wheel-sens':
        case 'pitch-wheel-sensitivity':
            _module._fluid_event_pitch_wheelsens(ev, event.channel, event.value);
            break;
        case 10 /* Modulation */:
        case 'modulation':
            _module._fluid_event_modulation(ev, event.channel, event.value);
            break;
        case 11 /* Sustain */:
        case 'sustain':
            _module._fluid_event_sustain(ev, event.channel, event.value);
            break;
        case 13 /* Pan */:
        case 'pan':
            _module._fluid_event_pan(ev, event.channel, event.value);
            break;
        case 14 /* Volume */:
        case 'volume':
            _module._fluid_event_volume(ev, event.channel, event.value);
            break;
        case 15 /* ReverbSend */:
        case 'reverb':
        case 'reverbsend':
        case 'reverb-send':
            _module._fluid_event_reverb_send(ev, event.channel, event.value);
            break;
        case 16 /* ChorusSend */:
        case 'chorus':
        case 'chorussend':
        case 'chorus-send':
            _module._fluid_event_chorus_send(ev, event.channel, event.value);
            break;
        case 20 /* KeyPressure */:
        case 'keypressure':
        case 'key-pressure':
        case 'aftertouch':
            _module._fluid_event_key_pressure(ev, event.channel, event.key, event.value);
            break;
        case 19 /* ChannelPressure */:
        case 'channelpressure':
        case 'channel-pressure':
        case 'channel-aftertouch':
            _module._fluid_event_channel_pressure(ev, event.channel, event.value);
            break;
        case 21 /* SystemReset */:
        case 'systemreset':
        case 'system-reset':
            _module._fluid_event_system_reset(ev);
            break;
        case 17 /* Timer */:
        case 'timer':
            _module._fluid_event_timer(ev, event.data);
            break;
        default:
            // 'typeof event' must be 'never' here
            return false;
    }
    return true;
}
/**
 * Rewrites event data with specified SequencerEvent object.
 * @param data destination instance
 * @param event source data
 * @return true if succeeded
 */
function rewriteEventData(data, event) {
    if (!data || !(data instanceof SequencerEventData)) {
        return false;
    }
    const ev = data.getRaw();
    if (ev === INVALID_POINTER) {
        return false;
    }
    return rewriteEventDataImpl(ev, event);
}

;// ./src/main/Sequencer.ts





let bound = false;
let fluid_sequencer_get_client_name;
function bindFunctionsForSequencer() {
    if (bound) {
        return;
    }
    bindFunctions();
    bound = true;
    fluid_sequencer_get_client_name =
        _module.cwrap('fluid_sequencer_get_client_name', 'string', ['number', 'number']);
}
function makeEvent(event) {
    const ev = _module._new_fluid_event();
    if (!rewriteEventDataImpl(ev, event)) {
        _module._delete_fluid_event(ev);
        return null;
    }
    return ev;
}
/** @internal */
class Sequencer {
    constructor() {
        bindFunctionsForSequencer();
        this._seq = INVALID_POINTER;
        this._seqId = -1;
        this._clientFuncMap = {};
    }
    /** @internal */
    _initialize() {
        this.close();
        this._seq = _module._new_fluid_sequencer2(0);
        this._seqId = -1;
        return Promise.resolve();
    }
    /** @internal */
    getRaw() {
        return this._seq;
    }
    close() {
        if (this._seq !== INVALID_POINTER) {
            Object.keys(this._clientFuncMap).forEach((clientIdStr) => {
                this.unregisterClient(Number(clientIdStr));
            });
            this.unregisterClient(-1);
            _module._delete_fluid_sequencer(this._seq);
            this._seq = INVALID_POINTER;
        }
    }
    registerSynthesizer(synth) {
        if (this._seqId !== -1) {
            _module._fluid_sequencer_unregister_client(this._seq, this._seqId);
            this._seqId = -1;
        }
        let val;
        if (typeof synth === 'number') {
            val = synth;
        }
        else if (synth instanceof Synthesizer) {
            val = synth.getRawSynthesizer();
        }
        else {
            return Promise.reject(new TypeError('\'synth\' is not a compatible type instance'));
        }
        this._seqId = _module._fluid_sequencer_register_fluidsynth(this._seq, val);
        return Promise.resolve(this._seqId);
    }
    unregisterClient(clientId) {
        if (clientId === -1) {
            clientId = this._seqId;
            if (clientId === -1) {
                return;
            }
        }
        // send 'unregistering' event
        const ev = _module._new_fluid_event();
        _module._fluid_event_set_source(ev, -1);
        _module._fluid_event_set_dest(ev, clientId);
        _module._fluid_event_unregistering(ev);
        _module._fluid_sequencer_send_now(this._seq, ev);
        _module._delete_fluid_event(ev);
        _module._fluid_sequencer_unregister_client(this._seq, clientId);
        if (this._seqId === clientId) {
            this._seqId = -1;
        }
        else {
            const map = this._clientFuncMap;
            if (map[clientId]) {
                _removeFunction(map[clientId]);
                delete map[clientId];
            }
        }
    }
    getAllRegisteredClients() {
        const c = _module._fluid_sequencer_count_clients(this._seq);
        const r = [];
        for (let i = 0; i < c; ++i) {
            const id = _module._fluid_sequencer_get_client_id(this._seq, i);
            const name = fluid_sequencer_get_client_name(this._seq, id);
            r.push({ clientId: id, name: name });
        }
        return Promise.resolve(r);
    }
    getClientCount() {
        return Promise.resolve(_module._fluid_sequencer_count_clients(this._seq));
    }
    getClientInfo(index) {
        const id = _module._fluid_sequencer_get_client_id(this._seq, index);
        const name = fluid_sequencer_get_client_name(this._seq, id);
        return Promise.resolve({ clientId: id, name: name });
    }
    setTimeScale(scale) {
        _module._fluid_sequencer_set_time_scale(this._seq, scale);
    }
    getTimeScale() {
        return Promise.resolve(_module._fluid_sequencer_get_time_scale(this._seq));
    }
    getTick() {
        return Promise.resolve(_module._fluid_sequencer_get_tick(this._seq));
    }
    sendEventAt(event, tick, isAbsolute) {
        const ev = makeEvent(event);
        if (ev !== null) {
            // send to all clients
            const count = _module._fluid_sequencer_count_clients(this._seq);
            for (let i = 0; i < count; ++i) {
                const id = _module._fluid_sequencer_get_client_id(this._seq, i);
                _module._fluid_event_set_dest(ev, id);
                _module._fluid_sequencer_send_at(this._seq, ev, tick, isAbsolute ? 1 : 0);
            }
            _module._delete_fluid_event(ev);
        }
    }
    sendEventToClientAt(clientId, event, tick, isAbsolute) {
        const ev = makeEvent(event);
        if (ev !== null) {
            _module._fluid_event_set_dest(ev, clientId === -1 ? this._seqId : clientId);
            _module._fluid_sequencer_send_at(this._seq, ev, tick, isAbsolute ? 1 : 0);
            _module._delete_fluid_event(ev);
        }
    }
    /** @internal */
    sendEventToClientNow(clientId, event) {
        const ev = makeEvent(event);
        if (ev !== null) {
            _module._fluid_event_set_dest(ev, clientId === -1 ? this._seqId : clientId);
            _module._fluid_sequencer_send_now(this._seq, ev);
            _module._delete_fluid_event(ev);
        }
    }
    /** @internal */
    sendEventNow(clientId, eventData) {
        if (!(eventData instanceof SequencerEventData)) {
            return;
        }
        const ev = eventData.getRaw();
        if (ev !== INVALID_POINTER) {
            _module._fluid_event_set_dest(ev, clientId === -1 ? this._seqId : clientId);
            _module._fluid_sequencer_send_now(this._seq, ev);
        }
    }
    removeAllEvents() {
        _module._fluid_sequencer_remove_events(this._seq, -1, -1, -1);
    }
    removeAllEventsFromClient(clientId) {
        _module._fluid_sequencer_remove_events(this._seq, -1, clientId === -1 ? this._seqId : clientId, -1);
    }
    processSequencer(msecToProcess) {
        if (this._seq !== INVALID_POINTER) {
            _module._fluid_sequencer_process(this._seq, msecToProcess);
        }
    }
    /** @internal */
    setIntervalForSequencer(msec) {
        return setInterval(() => this.processSequencer(msec), msec);
    }
}

;// ./src/main/Soundfont.ts


let Soundfont_bound = false;
let fluid_sfont_get_name;
let fluid_preset_get_name;
function bindFunctionsForSoundfont() {
    if (Soundfont_bound) {
        return;
    }
    bindFunctions();
    Soundfont_bound = true;
    fluid_sfont_get_name =
        _module.cwrap('fluid_sfont_get_name', 'string', ['number']);
    fluid_preset_get_name =
        _module.cwrap('fluid_preset_get_name', 'string', ['number']);
}
class Soundfont {
    // @internal
    constructor(sfontPtr) {
        this._ptr = sfontPtr;
    }
    static getSoundfontById(synth, id) {
        bindFunctionsForSoundfont();
        const sfont = _module._fluid_synth_get_sfont_by_id(synth.getRawSynthesizer(), id);
        if (sfont === INVALID_POINTER) {
            return null;
        }
        return new Soundfont(sfont);
    }
    getName() {
        return fluid_sfont_get_name(this._ptr);
    }
    getPreset(bank, presetNum) {
        const presetPtr = _module._fluid_sfont_get_preset(this._ptr, bank, presetNum);
        if (presetPtr === INVALID_POINTER) {
            return null;
        }
        const name = fluid_preset_get_name(presetPtr);
        const bankNum = _module._fluid_preset_get_banknum(presetPtr);
        const num = _module._fluid_preset_get_num(presetPtr);
        return {
            soundfont: this,
            name,
            bankNum,
            num
        };
    }
    getPresetIterable() {
        const reset = () => {
            _module._fluid_sfont_iteration_start(this._ptr);
        };
        const next = () => {
            const presetPtr = _module._fluid_sfont_iteration_next(this._ptr);
            if (presetPtr === 0) {
                return {
                    done: true,
                    value: undefined
                };
            }
            else {
                const name = fluid_preset_get_name(presetPtr);
                const bankNum = _module._fluid_preset_get_banknum(presetPtr);
                const num = _module._fluid_preset_get_num(presetPtr);
                return {
                    done: false,
                    value: {
                        soundfont: this,
                        name,
                        bankNum,
                        num
                    }
                };
            }
        };
        const iterator = () => {
            reset();
            return {
                next,
            };
        };
        return {
            [Symbol.iterator]: iterator,
        };
    }
}

;// ./src/main/Synthesizer.ts






function setBoolValueForSettings(settings, name, value) {
    if (typeof value !== 'undefined') {
        fluid_settings_setint(settings, name, value ? 1 : 0);
    }
}
function setIntValueForSettings(settings, name, value) {
    if (typeof value !== 'undefined') {
        fluid_settings_setint(settings, name, value);
    }
}
function setNumValueForSettings(settings, name, value) {
    if (typeof value !== 'undefined') {
        fluid_settings_setnum(settings, name, value);
    }
}
function setStrValueForSettings(settings, name, value) {
    if (typeof value !== 'undefined') {
        fluid_settings_setstr(settings, name, value);
    }
}
function getActiveVoiceCount(synth) {
    const actualCount = _module._fluid_synth_get_active_voice_count(synth);
    if (!actualCount) {
        return 0;
    }
    // FluidSynth may return incorrect value for active voice count,
    // so check internal data and correct it
    // check if the structure is not changed
    // for fluidsynth 2.0.x-2.1.x:
    //   140 === offset [synth->voice]
    //   144 === offset [synth->active_voice_count] for 
    // for fluidsynth 2.2.x:
    //   144 === offset [synth->voice]
    //   148 === offset [synth->active_voice_count]
    // first check 2.1.x structure
    let baseOffsetOfVoice = 140;
    let offsetOfActiveVoiceCount = (synth + baseOffsetOfVoice + 4) >> 2;
    let structActiveVoiceCount = _module.HEAPU32[offsetOfActiveVoiceCount];
    if (structActiveVoiceCount !== actualCount) {
        // add 4 for 2.2.x
        baseOffsetOfVoice += 4;
        offsetOfActiveVoiceCount = (synth + baseOffsetOfVoice + 4) >> 2;
        structActiveVoiceCount = _module.HEAPU32[offsetOfActiveVoiceCount];
        if (structActiveVoiceCount !== actualCount) {
            // unknown structure
            const c = console;
            c.warn('js-synthesizer: cannot check synthesizer internal data (may be changed)');
            return actualCount;
        }
    }
    const voiceList = _module.HEAPU32[(synth + baseOffsetOfVoice) >> 2];
    // (voice should not be NULL)
    if (!voiceList || voiceList >= _module.HEAPU32.byteLength) {
        // unknown structure
        const c = console;
        c.warn('js-synthesizer: cannot check synthesizer internal data (may be changed)');
        return actualCount;
    }
    // count of internal voice data is restricted to polyphony value
    const voiceCount = _module._fluid_synth_get_polyphony(synth);
    let isRunning = false;
    for (let i = 0; i < voiceCount; ++i) {
        // auto voice = voiceList[i]
        const voice = _module.HEAPU32[(voiceList >> 2) + i];
        if (!voice) {
            continue;
        }
        // offset [voice->status]
        const status = _module.HEAPU8[voice + 4];
        // 4: FLUID_VOICE_OFF
        if (status !== 4) {
            isRunning = true;
            break;
        }
    }
    if (!isRunning) {
        if (structActiveVoiceCount !== 0) {
            const c = console;
            c.warn('js-synthesizer: Active voice count is not zero, but all voices are off:', structActiveVoiceCount);
        }
        _module.HEAPU32[offsetOfActiveVoiceCount] = 0;
        return 0;
    }
    return actualCount;
}
function makeRandomFileName(type, ext) {
    return `/${type}-r${Math.random() * 65535}-${Math.random() * 65535}${ext}`;
}
function makeMIDIEventCallback(synth, cb, param) {
    return (data, event) => {
        const t = _module._fluid_midi_event_get_type(event);
        if (cb(synth, t, new MIDIEvent(event, _module), param)) {
            return 0;
        }
        return _module._fluid_synth_handle_midi_event(data, event);
    };
}
/** Default implementation of ISynthesizer */
class Synthesizer {
    constructor() {
        bindFunctions();
        this._settings = INVALID_POINTER;
        this._synth = INVALID_POINTER;
        this._player = INVALID_POINTER;
        this._playerPlaying = false;
        this._playerCallbackPtr = null;
        this._fluidSynthCallback = null;
        this._buffer = INVALID_POINTER;
        this._bufferSize = 0;
        this._numPtr = INVALID_POINTER;
        this._gain = 0.5 /* Gain */;
    }
    /**
     * Initializes with loaded FluidSynth module.
     * If using this method, you must call this before all methods/constructors, including `waitForWasmInitialized`.
     * @param mod loaded libfluidsynth.js instance (typically `const mod = Module` (loaded via script tag) or `const mod = require('libfluidsynth-*.js')` (in Node.js))
     */
    static initializeWithFluidSynthModule(mod) {
        bindFunctions(mod);
    }
    /** Return the promise object that resolves when WebAssembly has been initialized. */
    static waitForWasmInitialized() {
        return waitForInitialized();
    }
    isInitialized() {
        return this._synth !== INVALID_POINTER;
    }
    /** Return the raw synthesizer instance value (pointer for libfluidsynth). */
    getRawSynthesizer() {
        return this._synth;
    }
    createAudioNode(context, frameSize) {
        const node = context.createScriptProcessor(frameSize, 0, 2);
        node.addEventListener("audioprocess", (ev) => {
            this.render(ev.outputBuffer);
        });
        return node;
    }
    init(sampleRate, settings) {
        this.close();
        const set = (this._settings = _module._new_fluid_settings());
        fluid_settings_setnum(set, "synth.sample-rate", sampleRate);
        if (settings) {
            if (typeof settings.initialGain !== "undefined") {
                this._gain = settings.initialGain;
            }
            setBoolValueForSettings(set, "synth.chorus.active", settings.chorusActive);
            setNumValueForSettings(set, "synth.chorus.depth", settings.chorusDepth);
            setNumValueForSettings(set, "synth.chorus.level", settings.chorusLevel);
            setIntValueForSettings(set, "synth.chorus.nr", settings.chorusNr);
            setNumValueForSettings(set, "synth.chorus.speed", settings.chorusSpeed);
            setIntValueForSettings(set, "synth.midi-channels", settings.midiChannelCount);
            setStrValueForSettings(set, "synth.midi-bank-select", settings.midiBankSelect);
            setIntValueForSettings(set, "synth.min-note-length", settings.minNoteLength);
            setNumValueForSettings(set, "synth.overflow.age", settings.overflowAge);
            setNumValueForSettings(set, "synth.overflow.important", settings.overflowImportantValue);
            if (typeof settings.overflowImportantChannels !== "undefined") {
                fluid_settings_setstr(set, "synth.overflow.important-channels", settings.overflowImportantChannels.join(","));
            }
            setNumValueForSettings(set, "synth.overflow.percussion", settings.overflowPercussion);
            setNumValueForSettings(set, "synth.overflow.released", settings.overflowReleased);
            setNumValueForSettings(set, "synth.overflow.sustained", settings.overflowSustained);
            setNumValueForSettings(set, "synth.overflow.volume", settings.overflowVolume);
            setIntValueForSettings(set, "synth.polyphony", settings.polyphony);
            setBoolValueForSettings(set, "synth.reverb.active", settings.reverbActive);
            setNumValueForSettings(set, "synth.reverb.damp", settings.reverbDamp);
            setNumValueForSettings(set, "synth.reverb.level", settings.reverbLevel);
            setNumValueForSettings(set, "synth.reverb.room-size", settings.reverbRoomSize);
            setNumValueForSettings(set, "synth.reverb.width", settings.reverbWidth);
        }
        fluid_settings_setnum(set, "synth.gain", this._gain);
        this._synth = _module._new_fluid_synth(this._settings);
        this._numPtr = malloc(8);
    }
    close() {
        if (this._synth === INVALID_POINTER) {
            return;
        }
        this._closePlayer();
        _module._delete_fluid_synth(this._synth);
        this._synth = INVALID_POINTER;
        _module._delete_fluid_settings(this._settings);
        this._settings = INVALID_POINTER;
        free(this._numPtr);
        this._numPtr = INVALID_POINTER;
    }
    isPlaying() {
        return (this._synth !== INVALID_POINTER &&
            getActiveVoiceCount(this._synth) > 0);
    }
    setInterpolation(value, channel) {
        this.ensureInitialized();
        if (typeof channel === "undefined") {
            channel = -1;
        }
        _module._fluid_synth_set_interp_method(this._synth, channel, value);
    }
    getGain() {
        return this._gain;
    }
    setGain(gain) {
        this.ensureInitialized();
        _module._fluid_synth_set_gain(this._synth, gain);
        this._gain = _module._fluid_synth_get_gain(this._synth);
    }
    setChannelType(channel, isDrum) {
        this.ensureInitialized();
        // CHANNEL_TYPE_MELODIC = 0, CHANNEL_TYPE_DRUM = 1
        _module._fluid_synth_set_channel_type(this._synth, channel, isDrum ? 1 : 0);
    }
    waitForVoicesStopped() {
        return this.flushFramesAsync();
    }
    loadSFont(bin) {
        this.ensureInitialized();
        const name = makeRandomFileName("sfont", ".sf2");
        const ub = new Uint8Array(bin);
        _fs.writeFile(name, ub);
        const sfont = fluid_synth_sfload(this._synth, name, 1);
        _fs.unlink(name);
        return sfont === -1
            ? Promise.reject(new Error(fluid_synth_error(this._synth)))
            : Promise.resolve(sfont);
    }
    unloadSFont(id) {
        this.ensureInitialized();
        this.stopPlayer();
        this.flushFramesSync();
        _module._fluid_synth_sfunload(this._synth, id, 1);
    }
    unloadSFontAsync(id) {
        // not throw with Promise.reject
        this.ensureInitialized();
        this.stopPlayer();
        return this.flushFramesAsync().then(() => {
            _module._fluid_synth_sfunload(this._synth, id, 1);
        });
    }
    /**
     * Returns the `Soundfont` instance for specified SoundFont.
     * @param sfontId loaded SoundFont id ({@link loadSFont} returns this)
     * @return `Soundfont` instance or `null` if `sfontId` is not valid or loaded
     */
    getSFontObject(sfontId) {
        return Soundfont.getSoundfontById(this, sfontId);
    }
    getSFontBankOffset(id) {
        this.ensureInitialized();
        return Promise.resolve(_module._fluid_synth_get_bank_offset(this._synth, id));
    }
    setSFontBankOffset(id, offset) {
        this.ensureInitialized();
        _module._fluid_synth_set_bank_offset(this._synth, id, offset);
    }
    render(outBuffer) {
        const frameCount = "numberOfChannels" in outBuffer
            ? outBuffer.length
            : outBuffer[0].length;
        const channels = "numberOfChannels" in outBuffer
            ? outBuffer.numberOfChannels
            : outBuffer.length;
        const sizePerChannel = 4 * frameCount;
        const totalSize = sizePerChannel * 2;
        if (this._bufferSize < totalSize) {
            if (this._buffer !== INVALID_POINTER) {
                free(this._buffer);
            }
            this._buffer = malloc(totalSize);
            this._bufferSize = totalSize;
        }
        const memLeft = this._buffer;
        const memRight = (this._buffer +
            sizePerChannel);
        this.renderRaw(memLeft, memRight, frameCount);
        const aLeft = new Float32Array(_module.HEAPU8.buffer, memLeft, frameCount);
        const aRight = channels >= 2
            ? new Float32Array(_module.HEAPU8.buffer, memRight, frameCount)
            : null;
        if ("numberOfChannels" in outBuffer) {
            if (outBuffer.copyToChannel) {
                outBuffer.copyToChannel(aLeft, 0, 0);
                if (aRight) {
                    outBuffer.copyToChannel(aRight, 1, 0);
                }
            }
            else {
                // copyToChannel API not exist in Safari AudioBuffer
                const leftData = outBuffer.getChannelData(0);
                aLeft.forEach((val, i) => (leftData[i] = val));
                if (aRight) {
                    const rightData = outBuffer.getChannelData(1);
                    aRight.forEach((val, i) => (rightData[i] = val));
                }
            }
        }
        else {
            outBuffer[0].set(aLeft);
            if (aRight) {
                outBuffer[1].set(aRight);
            }
        }
        // check and update player status
        this.isPlayerPlaying();
    }
    midiNoteOn(chan, key, vel) {
        _module._fluid_synth_noteon(this._synth, chan, key, vel);
    }
    midiNoteOff(chan, key) {
        _module._fluid_synth_noteoff(this._synth, chan, key);
    }
    midiKeyPressure(chan, key, val) {
        _module._fluid_synth_key_pressure(this._synth, chan, key, val);
    }
    midiControl(chan, ctrl, val) {
        _module._fluid_synth_cc(this._synth, chan, ctrl, val);
    }
    midiProgramChange(chan, prognum) {
        _module._fluid_synth_program_change(this._synth, chan, prognum);
    }
    midiChannelPressure(chan, val) {
        _module._fluid_synth_channel_pressure(this._synth, chan, val);
    }
    midiPitchBend(chan, val) {
        _module._fluid_synth_pitch_bend(this._synth, chan, val);
    }
    midiSysEx(data) {
        const len = data.byteLength;
        const mem = malloc(len);
        _module.HEAPU8.set(data, mem);
        _module._fluid_synth_sysex(this._synth, mem, len, INVALID_POINTER, INVALID_POINTER, INVALID_POINTER, 0);
        free(mem);
    }
    midiPitchWheelSensitivity(chan, val) {
        _module._fluid_synth_pitch_wheel_sens(this._synth, chan, val);
    }
    midiBankSelect(chan, bank) {
        _module._fluid_synth_bank_select(this._synth, chan, bank);
    }
    midiSFontSelect(chan, sfontId) {
        _module._fluid_synth_sfont_select(this._synth, chan, sfontId);
    }
    midiProgramSelect(chan, sfontId, bank, presetNum) {
        _module._fluid_synth_program_select(this._synth, chan, sfontId, bank, presetNum);
    }
    midiUnsetProgram(chan) {
        _module._fluid_synth_unset_program(this._synth, chan);
    }
    midiProgramReset() {
        _module._fluid_synth_program_reset(this._synth);
    }
    midiSystemReset() {
        _module._fluid_synth_system_reset(this._synth);
    }
    midiAllNotesOff(chan) {
        _module._fluid_synth_all_notes_off(this._synth, typeof chan === "undefined" ? -1 : chan);
    }
    midiAllSoundsOff(chan) {
        _module._fluid_synth_all_sounds_off(this._synth, typeof chan === "undefined" ? -1 : chan);
    }
    midiSetChannelType(chan, isDrum) {
        // CHANNEL_TYPE_MELODIC = 0
        // CHANNEL_TYPE_DRUM = 1
        _module._fluid_synth_set_channel_type(this._synth, chan, isDrum ? 1 : 0);
    }
    /**
     * Set reverb parameters to the synthesizer.
     */
    setReverb(roomsize, damping, width, level) {
        _module._fluid_synth_set_reverb(this._synth, roomsize, damping, width, level);
    }
    /**
     * Set reverb roomsize parameter to the synthesizer.
     */
    setReverbRoomsize(roomsize) {
        _module._fluid_synth_set_reverb_roomsize(this._synth, roomsize);
    }
    /**
     * Set reverb damping parameter to the synthesizer.
     */
    setReverbDamp(damping) {
        _module._fluid_synth_set_reverb_damp(this._synth, damping);
    }
    /**
     * Set reverb width parameter to the synthesizer.
     */
    setReverbWidth(width) {
        _module._fluid_synth_set_reverb_width(this._synth, width);
    }
    /**
     * Set reverb level to the synthesizer.
     */
    setReverbLevel(level) {
        _module._fluid_synth_set_reverb_level(this._synth, level);
    }
    /**
     * Enable or disable reverb effect of the synthesizer.
     */
    setReverbOn(on) {
        _module._fluid_synth_set_reverb_on(this._synth, on ? 1 : 0);
    }
    /**
     * Get reverb roomsize parameter of the synthesizer.
     */
    getReverbRoomsize() {
        return _module._fluid_synth_get_reverb_roomsize(this._synth);
    }
    /**
     * Get reverb damping parameter of the synthesizer.
     */
    getReverbDamp() {
        return _module._fluid_synth_get_reverb_damp(this._synth);
    }
    /**
     * Get reverb level of the synthesizer.
     */
    getReverbLevel() {
        return _module._fluid_synth_get_reverb_level(this._synth);
    }
    /**
     * Get reverb width parameter of the synthesizer.
     */
    getReverbWidth() {
        return _module._fluid_synth_get_reverb_width(this._synth);
    }
    /**
     * Set chorus parameters to the synthesizer.
     */
    setChorus(voiceCount, level, speed, depthMillisec, type) {
        _module._fluid_synth_set_chorus(this._synth, voiceCount, level, speed, depthMillisec, type);
    }
    /**
     * Set chorus voice count parameter to the synthesizer.
     */
    setChorusVoiceCount(voiceCount) {
        _module._fluid_synth_set_chorus_nr(this._synth, voiceCount);
    }
    /**
     * Set chorus level parameter to the synthesizer.
     */
    setChorusLevel(level) {
        _module._fluid_synth_set_chorus_level(this._synth, level);
    }
    /**
     * Set chorus speed parameter to the synthesizer.
     */
    setChorusSpeed(speed) {
        _module._fluid_synth_set_chorus_speed(this._synth, speed);
    }
    /**
     * Set chorus depth parameter to the synthesizer.
     */
    setChorusDepth(depthMillisec) {
        _module._fluid_synth_set_chorus_depth(this._synth, depthMillisec);
    }
    /**
     * Set chorus modulation type to the synthesizer.
     */
    setChorusType(type) {
        _module._fluid_synth_set_chorus_type(this._synth, type);
    }
    /**
     * Enable or disable chorus effect of the synthesizer.
     */
    setChorusOn(on) {
        _module._fluid_synth_set_chorus_on(this._synth, on ? 1 : 0);
    }
    /**
     * Get chorus voice count of the synthesizer.
     */
    getChorusVoiceCount() {
        return _module._fluid_synth_get_chorus_nr(this._synth);
    }
    /**
     * Get chorus level of the synthesizer.
     */
    getChorusLevel() {
        return _module._fluid_synth_get_chorus_level(this._synth);
    }
    /**
     * Get chorus speed of the synthesizer.
     */
    getChorusSpeed() {
        return _module._fluid_synth_get_chorus_speed(this._synth);
    }
    /**
     * Get chorus depth (in milliseconds) of the synthesizer.
     */
    getChorusDepth() {
        return _module._fluid_synth_get_chorus_depth(this._synth);
    }
    /**
     * Get chorus modulation type of the synthesizer.
     */
    getChorusType() {
        return _module._fluid_synth_get_chorus_type(this._synth);
    }
    /**
     * Get generator value assigned to the MIDI channel.
     * @param channel MIDI channel number
     * @param param generator ID
     * @return a value related to the generator
     */
    getGenerator(channel, param) {
        return _module._fluid_synth_get_gen(this._synth, channel, param);
    }
    /**
     * Set generator value assigned to the MIDI channel.
     * @param channel MIDI channel number
     * @param param generator ID
     * @param value a value related to the generator
     */
    setGenerator(channel, param, value) {
        _module._fluid_synth_set_gen(this._synth, channel, param, value);
    }
    /**
     * Return the current legato mode of the channel.
     * @param channel MIDI channel number
     * @return legato mode
     */
    getLegatoMode(channel) {
        _module._fluid_synth_get_legato_mode(this._synth, channel, this._numPtr);
        return _module.HEAP32[this._numPtr >> 2];
    }
    /**
     * Set the current legato mode of the channel.
     * @param channel MIDI channel number
     * @param mode legato mode
     */
    setLegatoMode(channel, mode) {
        _module._fluid_synth_set_legato_mode(this._synth, channel, mode);
    }
    /**
     * Return the current portamento mode of the channel.
     * @param channel MIDI channel number
     * @return portamento mode
     */
    getPortamentoMode(channel) {
        _module._fluid_synth_get_portamento_mode(this._synth, channel, this._numPtr);
        return _module.HEAP32[this._numPtr >> 2];
    }
    /**
     * Set the current portamento mode of the channel.
     * @param channel MIDI channel number
     * @param mode portamento mode
     */
    setPortamentoMode(channel, mode) {
        _module._fluid_synth_set_portamento_mode(this._synth, channel, mode);
    }
    /**
     * Return the current breath mode of the channel.
     * @param channel MIDI channel number
     * @return breath mode (BreathFlags)
     */
    getBreathMode(channel) {
        _module._fluid_synth_get_breath_mode(this._synth, channel, this._numPtr);
        return _module.HEAP32[this._numPtr >> 2];
    }
    /**
     * Set the current breath mode of the channel.
     * @param channel MIDI channel number
     * @param flags breath mode flags (BreathFlags)
     */
    setBreathMode(channel, flags) {
        _module._fluid_synth_set_breath_mode(this._synth, channel, flags);
    }
    ////////////////////////////////////////////////////////////////////////////
    resetPlayer() {
        return new Promise((resolve) => {
            this._initPlayer();
            resolve();
        });
    }
    closePlayer() {
        this._closePlayer();
    }
    /** @internal */
    _initPlayer() {
        this._closePlayer();
        const player = _module._new_fluid_player(this._synth);
        this._player = player;
        if (player !== INVALID_POINTER) {
            if (this._fluidSynthCallback === null) {
                // hacky retrieve 'fluid_synth_handle_midi_event' callback pointer
                // * 'playback_callback' is filled with 'fluid_synth_handle_midi_event' by default.
                // * 'playback_userdata' is filled with the synthesizer pointer by default
                const funcPtr = _module.HEAPU32[(player + 588) >> 2]; // _fluid_player_t::playback_callback
                const synthPtr = _module.HEAPU32[(player + 592) >> 2]; // _fluid_player_t::playback_userdata
                if (synthPtr === this._synth) {
                    this._fluidSynthCallback = funcPtr;
                }
            }
        }
        else {
            throw new Error("Out of memory");
        }
    }
    /** @internal */
    _closePlayer() {
        const p = this._player;
        if (p === INVALID_POINTER) {
            return;
        }
        this.stopPlayer();
        _module._delete_fluid_player(p);
        this._player = INVALID_POINTER;
        this._playerCallbackPtr = null;
    }
    isPlayerPlaying() {
        if (this._playerPlaying) {
            const status = _module._fluid_player_get_status(this._player);
            if (status === 1 /*FLUID_PLAYER_PLAYING*/) {
                return true;
            }
            this.stopPlayer();
        }
        return false;
    }
    addSMFDataToPlayer(bin) {
        this.ensurePlayerInitialized();
        const len = bin.byteLength;
        const mem = malloc(len);
        _module.HEAPU8.set(new Uint8Array(bin), mem);
        const r = _module._fluid_player_add_mem(this._player, mem, len);
        free(mem);
        return r !== -1
            ? Promise.resolve()
            : Promise.reject(new Error(fluid_synth_error(this._synth)));
    }
    playPlayer() {
        this.ensurePlayerInitialized();
        if (this._playerPlaying) {
            this.stopPlayer();
        }
        if (_module._fluid_player_play(this._player) === -1) {
            return Promise.reject(new Error(fluid_synth_error(this._synth)));
        }
        this._playerPlaying = true;
        let resolver = () => { };
        const p = new Promise((resolve) => {
            resolver = resolve;
        });
        this._playerDefer = {
            promise: p,
            resolve: resolver,
        };
        return Promise.resolve();
    }
    stopPlayer() {
        const p = this._player;
        if (p === INVALID_POINTER || !this._playerPlaying) {
            return;
        }
        _module._fluid_player_stop(p);
        _module._fluid_player_join(p);
        _module._fluid_synth_all_sounds_off(this._synth, -1);
        if (this._playerDefer) {
            this._playerDefer.resolve();
            this._playerDefer = void 0;
        }
        this._playerPlaying = false;
    }
    retrievePlayerCurrentTick() {
        this.ensurePlayerInitialized();
        return Promise.resolve(_module._fluid_player_get_current_tick(this._player));
    }
    retrievePlayerTotalTicks() {
        this.ensurePlayerInitialized();
        return Promise.resolve(_module._fluid_player_get_total_ticks(this._player));
    }
    retrievePlayerBpm() {
        this.ensurePlayerInitialized();
        return Promise.resolve(_module._fluid_player_get_bpm(this._player));
    }
    retrievePlayerMIDITempo() {
        this.ensurePlayerInitialized();
        return Promise.resolve(_module._fluid_player_get_midi_tempo(this._player));
    }
    seekPlayer(ticks) {
        this.ensurePlayerInitialized();
        _module._fluid_player_seek(this._player, ticks);
    }
    setPlayerLoop(loopTimes) {
        this.ensurePlayerInitialized();
        _module._fluid_player_set_loop(this._player, loopTimes);
    }
    setPlayerTempo(tempoType, tempo) {
        this.ensurePlayerInitialized();
        _module._fluid_player_set_tempo(this._player, tempoType, tempo);
    }
    /**
     * Hooks MIDI events sent by the player.
     * initPlayer() must be called before calling this method.
     * @param callback hook callback function, or null to unhook
     * @param param any additional data passed to the callback
     */
    hookPlayerMIDIEvents(callback, param) {
        this.ensurePlayerInitialized();
        const oldPtr = this._playerCallbackPtr;
        if (oldPtr === null && callback === null) {
            return;
        }
        const newPtr = 
        // if callback is specified, add function
        callback !== null
            ? _addFunction(makeMIDIEventCallback(this, callback, param), "iii")
            : // if _fluidSynthCallback is filled, set null to use it for reset callback
                // if not, add function defaultMIDIEventCallback for reset
                this._fluidSynthCallback !== null
                    ? null
                    : _addFunction(defaultMIDIEventCallback, "iii");
        // the third parameter of 'fluid_player_set_playback_callback' should be 'fluid_synth_t*'
        if (oldPtr !== null && newPtr !== null) {
            // (using defaultMIDIEventCallback also comes here)
            _module._fluid_player_set_playback_callback(this._player, newPtr, this._synth);
            _removeFunction(oldPtr);
        }
        else {
            if (newPtr === null) {
                // newPtr === null --> use _fluidSynthCallback
                _module._fluid_player_set_playback_callback(this._player, this._fluidSynthCallback, this._synth);
                _removeFunction(oldPtr);
            }
            else {
                _module._fluid_player_set_playback_callback(this._player, newPtr, this._synth);
            }
        }
        this._playerCallbackPtr = newPtr;
    }
    /** @internal */
    ensureInitialized() {
        if (this._synth === INVALID_POINTER) {
            throw new Error("Synthesizer is not initialized");
        }
    }
    /** @internal */
    ensurePlayerInitialized() {
        this.ensureInitialized();
        if (this._player === INVALID_POINTER) {
            this._initPlayer();
        }
    }
    /** @internal */
    renderRaw(memLeft, memRight, frameCount) {
        _module._fluid_synth_write_float(this._synth, frameCount, memLeft, 0, 1, memRight, 0, 1);
    }
    /** @internal */
    flushFramesSync() {
        const frameCount = 65536;
        const size = 4 * frameCount;
        const mem = malloc(size * 2);
        const memLeft = mem;
        const memRight = (mem + size);
        while (this.isPlaying()) {
            this.renderRaw(memLeft, memRight, frameCount);
        }
        free(mem);
    }
    /** @internal */
    flushFramesAsync() {
        if (!this.isPlaying()) {
            return Promise.resolve();
        }
        const frameCount = 65536;
        const size = 4 * frameCount;
        const mem = malloc(size * 2);
        const memLeft = mem;
        const memRight = (mem + size);
        const nextFrame = typeof setTimeout !== "undefined"
            ? () => {
                return new Promise((resolve) => setTimeout(resolve, 0));
            }
            : () => {
                return Promise.resolve();
            };
        function head() {
            return nextFrame().then(tail);
        }
        const self = this;
        function tail() {
            if (!self.isPlaying()) {
                free(mem);
                return Promise.resolve();
            }
            self.renderRaw(memLeft, memRight, frameCount);
            return head();
        }
        return head();
    }
    waitForPlayerStopped() {
        return this._playerDefer
            ? this._playerDefer.promise
            : Promise.resolve();
    }
    /**
     * Create the sequencer object for this class.
     */
    static createSequencer() {
        bindFunctions();
        const seq = new Sequencer();
        return seq._initialize().then(() => seq);
    }
    /**
     * Registers the user-defined client to the sequencer.
     * The client can receive events in the time from sequencer process.
     * @param seq the sequencer instance created by Synthesizer.createSequencer
     * @param name the client name
     * @param callback the client callback function that processes event data
     * @param param additional parameter passed to the callback
     * @return registered sequencer client id (can be passed to seq.unregisterClient())
     */
    static registerSequencerClient(seq, name, callback, param) {
        if (!(seq instanceof Sequencer)) {
            throw new TypeError("Invalid sequencer instance");
        }
        const ptr = _addFunction((time, ev, _seq, data) => {
            const e = new SequencerEventData(ev, _module);
            const type = _module._fluid_event_get_type(ev);
            callback(time, type, e, seq, data);
        }, "viiii");
        const r = fluid_sequencer_register_client(seq.getRaw(), name, ptr, param);
        if (r !== -1) {
            seq._clientFuncMap[r] = ptr;
        }
        return r;
    }
    /**
     * Send sequencer event immediately to the specific client.
     * @param seq the sequencer instance created by Synthesizer.createSequencer
     * @param clientId registered client id (-1 for registered synthesizer)
     * @param event event data
     */
    static sendEventToClientNow(seq, clientId, event) {
        if (!(seq instanceof Sequencer)) {
            throw new TypeError("Invalid sequencer instance");
        }
        seq.sendEventToClientNow(clientId, event);
    }
    /**
     * (Re-)send event data immediately.
     * @param seq the sequencer instance created by Synthesizer.createSequencer
     * @param clientId registered client id (-1 for registered synthesizer)
     * @param eventData event data which can be retrieved in SequencerClientCallback
     */
    static sendEventNow(seq, clientId, eventData) {
        if (!(seq instanceof Sequencer)) {
            throw new TypeError("Invalid sequencer instance");
        }
        seq.sendEventNow(clientId, eventData);
    }
    /**
     * Set interval timer process to call processSequencer for this sequencer.
     * This method uses 'setInterval' global method to register timer.
     * @param seq the sequencer instance created by Synthesizer.createSequencer
     * @param msec time in milliseconds passed to both setInterval and processSequencer
     * @return return value of 'setInterval' (usually passing to 'clearInterval' will reset event)
     */
    static setIntervalForSequencer(seq, msec) {
        if (!(seq instanceof Sequencer)) {
            throw new TypeError("Invalid sequencer instance");
        }
        return seq.setIntervalForSequencer(msec);
    }
}

;// ./src/main/waitForReady.ts

/**
 * Returns the Promise object which resolves when the synthesizer engine is ready.
 */
function waitForReady() {
    return Synthesizer.waitForWasmInitialized();
}

;// ./src/main/MessageError.ts
/** Error object used for errors occurred in the message receiver (e.g. Worklet) */
class MessageError extends Error {
    constructor(baseName, message, detail) {
        super(message);
        this.baseName = baseName;
        this.detail = detail;
        if (detail && detail.stack) {
            this.stack = detail.stack;
        }
    }
}

;// ./src/main/MethodMessaging.ts

/** @internal */
function initializeCallPort(port, hookMessage) {
    const instance = {
        port: port,
        defers: {},
        deferId: 0
    };
    port.addEventListener('message', (e) => processReturnMessage(instance.defers, hookMessage, e));
    port.start();
    return instance;
}
function convertErrorTransferable(err) {
    const result = {};
    const objList = [];
    let obj = err;
    while (obj && obj !== Object.prototype) {
        objList.unshift(obj);
        obj = Object.getPrototypeOf(obj);
    }
    objList.forEach((o) => {
        Object.getOwnPropertyNames(o).forEach((key) => {
            try {
                const data = err[key];
                if (typeof data !== 'function' && typeof data !== 'symbol') {
                    result[key] = data;
                }
            }
            catch (_e) { }
        });
    });
    return {
        baseName: err.name,
        message: err.message,
        detail: result
    };
}
function convertAnyErrorTransferable(err) {
    return convertErrorTransferable((err && err instanceof Error) ? err : new Error(`${err}`));
}
function makeMessageError(error) {
    return new MessageError(error.baseName, error.message, error.detail);
}
function processReturnMessage(defers, hook, e) {
    const data = e.data;
    if (!data) {
        return;
    }
    if (hook && hook(data)) {
        return;
    }
    const defer = defers[data.id];
    if (defer) {
        delete defers[data.id];
        if (data.error) {
            defer.reject(makeMessageError(data.error));
        }
        else {
            defer.resolve(data.val);
        }
    }
    else {
        if (data.error) {
            throw makeMessageError(data.error);
        }
    }
}
/** @internal */
function postCall({ port }, method, args) {
    port.postMessage({
        id: -1, method, args
    });
}
/** @internal */
function postCallWithPromise(instance, method, args) {
    const id = instance.deferId++;
    if (instance.deferId === Infinity || instance.deferId < 0) {
        instance.deferId = 0;
    }
    const promise = new Promise((resolve, reject) => {
        instance.defers[id] = { resolve, reject };
    });
    const transfers = [];
    if (args[0] instanceof MessagePort) {
        transfers.push(args[0]);
    }
    instance.port.postMessage({
        id, method, args
    }, transfers);
    return promise;
}
/** @internal */
function initializeReturnPort(port, promiseInitialized, targetObjectHolder, hookMessage) {
    const instance = {
        port: port
    };
    if (promiseInitialized) {
        port.addEventListener('message', (e) => {
            const data = e.data;
            if (!data) {
                return;
            }
            promiseInitialized.then(() => processCallMessage(instance.port, data, targetObjectHolder, hookMessage));
        });
    }
    else {
        port.addEventListener('message', (e) => {
            const data = e.data;
            if (!data) {
                return;
            }
            processCallMessage(instance.port, data, targetObjectHolder, hookMessage);
        });
    }
    port.start();
    return instance;
}
function processCallMessage(port, data, targetObjectHolder, hook) {
    if (hook && hook(data)) {
        return;
    }
    const target = targetObjectHolder();
    if (!target[data.method]) {
        postReturnErrorImpl(port, data.id, data.method, new Error('Not implemented'));
    }
    else {
        try {
            postReturnImpl(port, data.id, data.method, target[data.method].apply(target, data.args));
        }
        catch (e) {
            postReturnErrorImpl(port, data.id, data.method, e);
        }
    }
}
/** @internal */
function postReturn(instance, id, method, value) {
    postReturnImpl(instance.port, id, method, value);
}
function postReturnImpl(port, id, method, value) {
    if (value instanceof Promise) {
        value.then((v) => {
            if (id >= 0) {
                port.postMessage({
                    id,
                    method,
                    val: v
                });
            }
        }, (error) => {
            port.postMessage({
                id,
                method,
                error: convertAnyErrorTransferable(error)
            });
        });
    }
    else {
        port.postMessage({
            id,
            method,
            val: value
        });
    }
}
/** @internal */
function postReturnError(instance, id, method, error) {
    postReturnErrorImpl(instance.port, id, method, error);
}
function postReturnErrorImpl(port, id, method, error) {
    port.postMessage({
        id,
        method,
        error: convertAnyErrorTransferable(error)
    });
}

;// ./src/main/logging.ts

let _ptrDefaultLogFunction;
let _disabledLoggingLevel = null;
const _handlers = [];
const LOG_LEVEL_COUNT = 5;
/** Log level for libfluidsynth */
const LogLevel = {
    Panic: 0,
    Error: 1,
    Warning: 2,
    Info: 3,
    Debug: 4,
};

/**
 * Disable log output from libfluidsynth.
 * @param level disable log level (when `LogLevel.Warning` is specified, `Warning` `Info` `Debug` is disabled)
 * - If `null` is specified, log output feature is restored to the default.
 */
function disableLogging(level = LogLevel.Panic) {
    if (_disabledLoggingLevel === level) {
        return;
    }
    bindFunctions();
    if (level == null) {
        if (_ptrDefaultLogFunction != null) {
            _module._fluid_set_log_function(0, _ptrDefaultLogFunction, 0);
            _module._fluid_set_log_function(1, _ptrDefaultLogFunction, 0);
            _module._fluid_set_log_function(2, _ptrDefaultLogFunction, 0);
            _module._fluid_set_log_function(3, _ptrDefaultLogFunction, 0);
        }
        _module._fluid_set_log_function(4, 0, 0);
    }
    else {
        let ptr;
        for (let l = level; l < LOG_LEVEL_COUNT; ++l) {
            const p = _module._fluid_set_log_function(l, 0, 0);
            if (l !== LogLevel.Debug) {
                ptr = p;
            }
        }
        if (ptr != null && _ptrDefaultLogFunction == null) {
            _ptrDefaultLogFunction = ptr;
        }
    }
    _disabledLoggingLevel = level;
    for (const fn of _handlers) {
        fn(level);
    }
}
/**
 * Restores the log output from libfluidsynth. Same for calling `disableLogging(null)`.
 */
function restoreLogging() {
    disableLogging(null);
}
// @internal
function getDisabledLoggingLevel() {
    return _disabledLoggingLevel;
}
// @internal
function addLoggingStatusChangedHandler(fn) {
    _handlers.push(fn);
}
// @internal
function removeLoggingStatusChangedHandler(fn) {
    for (let i = 0; i < _handlers.length; ++i) {
        if (_handlers[i] === fn) {
            _handlers.splice(i, 1);
            return;
        }
    }
}

;// ./src/main/registerAudioWorkletProcessor.ts
var __awaiter = (undefined && undefined.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};




const promiseWasmInitialized = waitForReady();
/** Registers processor using Synthesizer for AudioWorklet. */
function registerAudioWorkletProcessor() {
    /**
     * The processor using Synthesizer
     */
    class Processor extends AudioWorkletProcessor {
        constructor(options) {
            super(options);
            const processorOptions = options.processorOptions;
            const settings = processorOptions && processorOptions.settings;
            if (processorOptions && processorOptions.disabledLoggingLevel) {
                disableLogging(processorOptions.disabledLoggingLevel);
            }
            const promiseInitialized = this.doInit(settings);
            this._messaging = initializeReturnPort(this.port, promiseInitialized, () => this.synth, (data) => {
                switch (data.method) {
                    case 'init':
                        this.synth.init(sampleRate, settings);
                        return true;
                    case 'createSequencer':
                        this.doCreateSequencer(data.args[0]).then(() => {
                            postReturn(this._messaging, data.id, data.method, void (0));
                        });
                        return true;
                    case 'hookPlayerMIDIEventsByName':
                        {
                            const r = this.doHookPlayerMIDIEvents(data.args[0], data.args[1]);
                            if (r) {
                                postReturn(this._messaging, data.id, data.method, void (0));
                            }
                            else {
                                postReturnError(this._messaging, data.id, data.method, new Error('Name not found'));
                            }
                        }
                        return true;
                    case 'callFunction':
                        try {
                            this.doCallFunction(data.args[0], data.args[1]);
                            postReturn(this._messaging, data.id, data.method, void (0));
                        }
                        catch (e) {
                            postReturnError(this._messaging, data.id, data.method, e);
                        }
                        return true;
                    case 'getSFontObject':
                        try {
                            const name = this.doGetSFontObject(data.args[0], data.args[1]);
                            if (name !== null) {
                                postReturn(this._messaging, data.id, data.method, name);
                            }
                            else {
                                postReturnError(this._messaging, data.id, data.method, new Error('Invalid sfontId'));
                            }
                        }
                        catch (e) {
                            postReturnError(this._messaging, data.id, data.method, e);
                        }
                        return true;
                    case 'playPlayer':
                        this.doPlayPlayer(data);
                        return true;
                    case 'loggingChanged':
                        disableLogging(data.args[0]);
                        return true;
                }
                return false;
            });
        }
        doInit(settings) {
            return __awaiter(this, void 0, void 0, function* () {
                yield promiseWasmInitialized;
                this.synth = new Synthesizer();
                this.synth.init(sampleRate, settings);
            });
        }
        doCreateSequencer(port) {
            return Synthesizer.createSequencer().then((seq) => {
                const messaging = initializeReturnPort(port, null, () => seq, (data) => {
                    // special handle for Sequencer
                    if (data.method === 'getRaw') {
                        postReturn(messaging, data.id, data.method, seq.getRaw());
                        return true;
                    }
                    else if (data.method === 'registerSequencerClientByName') {
                        const r = this.doRegisterSequencerClient(seq, data.args[0], data.args[1], data.args[2]);
                        if (r !== null) {
                            postReturn(messaging, data.id, data.method, r);
                        }
                        else {
                            postReturnError(messaging, data.id, data.method, new Error('Name not found'));
                        }
                        return true;
                    }
                    return false;
                });
            });
        }
        doGetSFontObject(port, sfontId) {
            const sfont = this.synth.getSFontObject(sfontId);
            if (sfont === null) {
                return null;
            }
            const messaging = initializeReturnPort(port, null, () => sfont, (data) => {
                if (data.method === 'getPresetIterable') {
                    postReturn(messaging, data.id, data.method, [...sfont.getPresetIterable()]);
                    return true;
                }
                return false;
            });
            return sfont.getName();
        }
        doPlayPlayer(data) {
            const syn = this.synth;
            syn.playPlayer().then(() => {
                postReturn(this._messaging, -1, "updateStatus" /* UpdateStatus */, {
                    playing: syn.isPlaying(),
                    playerPlaying: syn.isPlayerPlaying()
                });
                postReturn(this._messaging, data.id, data.method, void (0));
            }, (e) => {
                postReturnError(this._messaging, data.id, data.method, e);
            });
        }
        doHookPlayerMIDIEvents(name, param) {
            if (!name) {
                this.synth.hookPlayerMIDIEvents(null);
                return true;
            }
            const fn = (AudioWorkletGlobalScope[name]);
            if (fn && typeof fn === 'function') {
                this.synth.hookPlayerMIDIEvents(fn, param);
                return true;
            }
            return false;
        }
        doCallFunction(name, param) {
            const fn = (AudioWorkletGlobalScope[name]);
            if (fn && typeof fn === 'function') {
                fn.call(null, this.synth, param);
                return;
            }
            throw new Error('Name not found');
        }
        doRegisterSequencerClient(seq, clientName, callbackName, param) {
            const fn = (AudioWorkletGlobalScope[callbackName]);
            if (fn && typeof fn === 'function') {
                return Synthesizer.registerSequencerClient(seq, clientName, fn, param);
            }
            return null;
        }
        process(_inputs, outputs) {
            if (!this.synth) {
                return true;
            }
            const syn = this.synth;
            syn.render(outputs[0]);
            postReturn(this._messaging, -1, "updateStatus" /* UpdateStatus */, {
                playing: syn.isPlaying(),
                playerPlaying: syn.isPlayerPlaying()
            });
            return true;
        }
    }
    registerProcessor("js-synthesizer" /* ProcessorName */, Processor);
}

;// ./src/main/workletEntry.ts




AudioWorkletGlobalScope.JSSynth = {
    rewriteEventData: rewriteEventData,
    Synthesizer: Synthesizer,
    disableLogging: disableLogging,
    restoreLogging: restoreLogging,
};
// deprecated
AudioWorkletGlobalScope.Fluid = AudioWorkletGlobalScope.JSSynth;
registerAudioWorkletProcessor();

/******/ })()
;
//# sourceMappingURL=js-synthesizer.worklet.js.map