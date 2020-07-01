<template>
  <div class="flasher">
    <b-button
      id="connect"
      :type="connected ? 'is-warning' : 'is-primary'"
      @click="clickConnect"
    >
      {{ connected ? 'Disconnect' : 'Connect' }}
    </b-button>
    <b-button
      id="dump"
      :disabled="dumpButtonDisabled"
      @click="dump"
    >
      Dump
    </b-button>
    <p style="word-break: break-word;">
      {{ dumpText }}
    </p>
  </div>
</template>

<script>
import serial from '../serial.js'
import constants from '../Constants.js'

export default {
  name: 'Flasher',
  props: {
  },
  data () {
    return {
      port: undefined,
      connected: false,
      dumpButtonDisabled: true,
      textDecoder: new TextDecoder(),
      textEncoder: new TextEncoder(),
      dumpText: ''
    }
  },
  created () {
    serial.getPorts().then(ports => {
      if (ports.length === 0) {
        console.log('No devices found.')
      } else {
        this.port = ports[0]
        this.connect()
      }
    })
  },
  methods: {
    connect () {
      // t.io.println('Connecting to ' + this.port.device_.productName + '...');
      this.port.connect().then(() => {
        this.connected = true
        this.dumpButtonDisabled = false
        this.port.onReceive = data => {
          // read serial input and split into 2 character chunks
          // normally input is already in chunks, but for some reason the last 2 bytes get combined
          const decoded = data.match(/[a-z]+|[^a-z]+/gi)
          decoded.forEach((string) => {
            if (/[G-X]/gm.test(string)) {
              this.decodeAndApplyAction(string)
            } else {
              this.dumpText += parseInt(string).toString(16).padStart(2, '0')
            }
          })
        }
        this.port.onReceiveError = error => {
          console.log('Receive error: ' + error)
        }
      }, error => {
        console.log('Connection error: ' + error)
      })
    },
    dump () {
      this.dumpText = ''
      this.dumpButtonDisabled = true
        .then(() => {
        })
      this.port.send(this.textEncoder.encode(constants.READSTART.value))
        .catch(error => {
          console.log('Send error: ' + error)
        })
    },
    clickConnect () {
      if (this.port) {
        this.port.disconnect()
        this.connected = false
        this.dumpButtonDisabled = true
        this.port = null
      } else {
        serial.requestPort().then(selectedPort => {
          this.port = selectedPort
          this.connect()
        }).catch(error => {
          console.log('Connection error: ' + error)
        })
      }
    },
    stringIsHex (text) {
      return text.match(/^[A-Fa-f0-9]{2}$/i) !== null
    },
    decodeAndApplyAction (action) {
      switch (action) {
        case constants.READSTART.value: // read start
          this.dumpText = ''
          break
        case constants.READEND.value: // read completed
          this.dumpButtonDisabled = false
          break
        default:
          console.log('Unknown action recieved: ', action)
          break
      }
    }
  }
}
</script>

<style scoped>
</style>
