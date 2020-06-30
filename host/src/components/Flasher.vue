<template>
  <div class="flasher">
    <button
      id="connect"
      @click="clickConnect"
    >
      {{ connectButtonText }}
    </button>
    <button
      id="dump"
      :disabled="dumpButtonDisabled"
      @click="dump"
    >
      Dump
    </button>
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
      connectButtonText: 'Connect',
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
        console.log(this.port)
        this.connectButtonText = 'Disconnect'
        this.dumpButtonDisabled = false
        this.port.onReceive = data => {
          // read serial input and split into 2 character chunks
          // normally input is already in chunks, but for some reason the last 2 bytes get combined
          const strings = this.textDecoder.decode(data).match(/.{1,2}/g)
          strings.forEach((string) => {
            if (this.stringIsHex(string)) {
              this.dumpText += string
            } else {
              this.decodeAndApplyAction(string)
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
      this.port.send(this.textEncoder.encode(constants.DUMPSTART.value))
        .then(() => {
        })
        .catch(error => {
          console.log('Send error: ' + error)
        })
    },
    clickConnect () {
      if (this.port) {
        this.port.disconnect()
        this.connectButtonText = 'Connect'
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
        case constants.DUMPSTART.value: // dump start
          this.dumpText = ''
          break
        case constants.DUMPEND.value: // dump completed
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
