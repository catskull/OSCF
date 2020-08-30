// takes 24 bytes starting at 0x0134 and returns an object of header properties
export default (header) => {
  var title = ''
  header = header.split(' ')
  header.slice(0, 10).forEach(element => {
    const char = String.fromCharCode(parseInt(element, 16)).replace(/\W/g, '')
    title += char || ' '
  })

  var sgbSupport = false
  switch (header[18]) { // sgb flag
    case '03':
      sgbSupport = true
      break
    default:
      sgbSupport = false
      break
  }

  var cartType = ''
  switch (header[19]) { // cart type
    case '00':
      cartType = 'ROM ONLY'
      break
    case '01':
      cartType = 'MBC1'
      break
    case '02':
      cartType = 'MBC1+RAM'
      break
    case '03':
      cartType = 'MBC1+RAM+BATTERY'
      break
    case '05':
      cartType = 'MBC2'
      break
    case '06':
      cartType = 'MBC2+BATTERY'
      break
    case '08':
      cartType = 'ROM+RAM'
      break
    case '09':
      cartType = 'ROM+RAM+BATTERY'
      break
    case '0B':
      cartType = 'MMM01'
      break
    case '0C':
      cartType = 'MMM01+RAM'
      break
    case '0D':
      cartType = 'MMM01+RAM+BATTERY'
      break
    case '0F':
      cartType = 'MBC3+TIMER+BATTERY'
      break
    case '10':
      cartType = 'MBC3+TIMER+RAM+BATTERY'
      break
    case '11':
      cartType = 'MBC3'
      break
    case '12':
      cartType = 'MBC3+RAM'
      break
    case '13':
      cartType = 'MBC3+RAM+BATTERY'
      break
    case '19':
      cartType = 'MBC5'
      break
    case '1A':
      cartType = 'MBC5+RAM'
      break
    case '1B':
      cartType = 'MBC5+RAM+BATTERY'
      break
    case '1C':
      cartType = 'MBC5+RUMBLE'
      break
    case '1D':
      cartType = 'MBC5+RUMBLE+RAM'
      break
    case '1E':
      cartType = 'MBC5+RUMBLE+RAM+BATTERY'
      break
    case '20':
      cartType = 'MBC6'
      break
    case '22':
      cartType = 'MBC7+SENSOR+RUMBLE+RAM+BATTERY'
      break
    case 'FC':
      cartType = 'POCKET CAMERA'
      break
    case 'FD':
      cartType = 'BANDAI TAMA5'
      break
    case 'FE':
      cartType = 'HuC3'
      break
    case 'FF':
      cartType = 'HuC1+RAM+BATTERY'
      break
  }

  var romSize = ''
  var romSizeBytes = 0
  switch (header[20]) { // rom size
    case '00':
      romSize = '32 KByte'
      romSizeBytes = 32768
      break
    case '01':
      romSize = '64 KByte'
      romSizeBytes = 65536
      break
    case '02':
      romSize = '128 KByte'
      romSizeBytes = 131072
      break
    case '03':
      romSize = '256 KByte'
      romSizeBytes = 262144
      break
    case '04':
      romSize = '512 KByte'
      romSizeBytes = 524288
      break
    case '05':
      romSize = '1 MByte'
      romSizeBytes = 1048576
      break
    case '06':
      romSize = '2 MByte'
      romSizeBytes = 2097152
      break
    case '07':
      romSize = '4 MByte'
      romSizeBytes = 4194304
      break
    case '08':
      romSize = '8 MByte'
      romSizeBytes = 8388608
      break
    case '52':
      romSize = '1.1 MByte'
      romSizeBytes = 1153434
      break
    case '53':
      romSize = '1.2 MByte'
      romSizeBytes = 1200
      break
    case '54':
      romSize = '1.5 MByte'
      romSizeBytes = 1500
      break
  }

  var ramSize = ''
  var ramSizeBytes = 0
  switch (header[21]) { // ram size
    case '00':
      ramSize = 'None'
      ramSizeBytes = 0
      break
    case '01':
      ramSize = '2 KBytes'
      ramSizeBytes = 2
      break
    case '02':
      ramSize = '8 Kbytes'
      ramSizeBytes = 8
      break
    case '03':
      ramSize = '32 KBytes'
      ramSizeBytes = 32
      break
    case '04':
      ramSize = '128 KBytes'
      ramSizeBytes = 128
      break
    case '05':
      ramSize = '64 KBytes'
      ramSizeBytes = 64
      break
  }
  ramSizeBytes = ramSizeBytes * 1000

  var japan = false // destination code
  switch (header[22]) {
    case '00':
      japan = true
      break
    default:
      japan = false
      break
  }

  var licensee = '' // old licensee
  switch (header[23]) {
    case '00':
      licensee = 'none'
      break
    case '01':
      licensee = 'nintendo'
      break
    case '08':
      licensee = 'capcom'
      break
    case '09':
      licensee = 'hot-b'
      break
    case '0A':
      licensee = 'jaleco'
      break
    case '0B':
      licensee = 'coconuts'
      break
    case '0C':
      licensee = 'elite systems'
      break
    case '13':
      licensee = 'electronic arts'
      break
    case '18':
      licensee = 'hudsonsoft'
      break
    case '19':
      licensee = 'itc entertainment'
      break
    case '1A':
      licensee = 'yanoman'
      break
    case '1D':
      licensee = 'clary'
      break
    case '1F':
      licensee = 'virgin'
      break
    case '24':
      licensee = 'pcm complete'
      break
    case '25':
      licensee = 'san-x'
      break
    case '28':
      licensee = 'kotobuki systems'
      break
    case '29':
      licensee = 'seta'
      break
    case '30':
      licensee = 'infogrames'
      break
    case '31':
      licensee = 'nintendo'
      break
    case '32':
      licensee = 'bandai'
      break
    case '33':
      switch (String.fromCharCode(parseInt(header[16], 16)) + String.fromCharCode(parseInt(header[17], 16))) {
        case '00':
          licensee = 'none'
          break
        case '01':
          licensee = 'Nintendo R&D1'
          break
        case '08':
          licensee = 'Capcom'
          break
        case '13':
          licensee = 'Electronic Arts'
          break
        case '18':
          licensee = 'Hudson Soft'
          break
        case '19':
          licensee = 'b-ai'
          break
        case '20':
          licensee = 'kss'
          break
        case '22':
          licensee = 'pow'
          break
        case '24':
          licensee = 'PCM Complete'
          break
        case '25':
          licensee = 'san-x'
          break
        case '28':
          licensee = 'Kemco Japan'
          break
        case '29':
          licensee = 'seta'
          break
        case '30':
          licensee = 'Viacom'
          break
        case '31':
          licensee = 'Nintendo'
          break
        case '32':
          licensee = 'Bandai'
          break
        case '33':
          licensee = 'Ocean/Acclaim'
          break
        case '34':
          licensee = 'Konami'
          break
        case '35':
          licensee = 'Hector'
          break
        case '37':
          licensee = 'Taito'
          break
        case '38':
          licensee = 'Hudson'
          break
        case '39':
          licensee = 'Banpresto'
          break
        case '41':
          licensee = 'Ubi Soft'
          break
        case '42':
          licensee = 'Atlus'
          break
        case '44':
          licensee = 'Malibu'
          break
        case '46':
          licensee = 'angel'
          break
        case '47':
          licensee = 'Bullet-Proof'
          break
        case '49':
          licensee = 'irem'
          break
        case '50':
          licensee = 'Absolute'
          break
        case '51':
          licensee = 'Acclaim'
          break
        case '52':
          licensee = 'Activision'
          break
        case '53':
          licensee = 'American sammy'
          break
        case '54':
          licensee = 'Konami'
          break
        case '55':
          licensee = 'Hi tech entertainment'
          break
        case '56':
          licensee = 'LJN'
          break
        case '57':
          licensee = 'Matchbox'
          break
        case '58':
          licensee = 'Mattel'
          break
        case '59':
          licensee = 'Milton Bradley'
          break
        case '60':
          licensee = 'Titus'
          break
        case '61':
          licensee = 'Virgin'
          break
        case '64':
          licensee = 'LucasArts'
          break
        case '67':
          licensee = 'Ocean'
          break
        case '69':
          licensee = 'Electronic Arts'
          break
        case '70':
          licensee = 'Infogrames'
          break
        case '71':
          licensee = 'Interplay'
          break
        case '72':
          licensee = 'Broderbund'
          break
        case '73':
          licensee = 'sculptured'
          break
        case '75':
          licensee = 'sci'
          break
        case '78':
          licensee = 'THQ'
          break
        case '79':
          licensee = 'Accolade'
          break
        case '80':
          licensee = 'misawa'
          break
        case '83':
          licensee = 'lozc'
          break
        case '86':
          licensee = 'Tokuma Shoten Intermedia'
          break
        case '87':
          licensee = 'Tsukuda Original'
          break
        case '91':
          licensee = 'Chunsoft'
          break
        case '92':
          licensee = 'Video system'
          break
        case '93':
          licensee = 'Ocean/Acclaim'
          break
        case '95':
          licensee = 'Varie'
          break
        case '96':
          licensee = 'Yonezawa/s\'pal'
          break
        case '97':
          licensee = 'Kaneko'
          break
        case '99':
          licensee = 'Pack in soft'
          break
        case 'A4':
          licensee = 'Konami (Yu-Gi-Oh!)'
          break
      }
      break
    case '34':
      licensee = 'konami'
      break
    case '35':
      licensee = 'hector'
      break
    case '38':
      licensee = 'capcom'
      break
    case '39':
      licensee = 'banpresto'
      break
    case '3C':
      licensee = '*entertainment i'
      break
    case '3E':
      licensee = 'gremlin'
      break
    case '41':
      licensee = 'ubi soft'
      break
    case '42':
      licensee = 'atlus'
      break
    case '44':
      licensee = 'malibu'
      break
    case '46':
      licensee = 'angel'
      break
    case '47':
      licensee = 'spectrum holoby'
      break
    case '49':
      licensee = 'irem'
      break
    case '4A':
      licensee = 'virgin'
      break
    case '4D':
      licensee = 'malibu'
      break
    case '4F':
      licensee = 'u.s. gold'
      break
    case '50':
      licensee = 'absolute'
      break
    case '51':
      licensee = 'acclaim'
      break
    case '52':
      licensee = 'activision'
      break
    case '53':
      licensee = 'american sammy'
      break
    case '54':
      licensee = 'gametek'
      break
    case '55':
      licensee = 'park place'
      break
    case '56':
      licensee = 'ljn'
      break
    case '57':
      licensee = 'matchbox'
      break
    case '59':
      licensee = 'milton bradley'
      break
    case '5A':
      licensee = 'mindscape'
      break
    case '5B':
      licensee = 'romstar'
      break
    case '5C':
      licensee = 'naxat soft'
      break
    case '5D':
      licensee = 'tradewest'
      break
    case '60':
      licensee = 'titus'
      break
    case '61':
      licensee = 'virgin'
      break
    case '67':
      licensee = 'ocean'
      break
    case '69':
      licensee = 'electronic arts'
      break
    case '6E':
      licensee = 'elite systems'
      break
    case '6F':
      licensee = 'electro brain'
      break
    case '70':
      licensee = 'infogrames'
      break
    case '71':
      licensee = 'interplay'
      break
    case '72':
      licensee = 'broderbund'
      break
    case '73':
      licensee = 'sculptered soft'
      break
    case '75':
      licensee = 'the sales curve'
      break
    case '78':
      licensee = 't*hq'
      break
    case '79':
      licensee = 'accolade'
      break
    case '7A':
      licensee = 'triffix entertainment'
      break
    case '7C':
      licensee = 'microprose'
      break
    case '7F':
      licensee = 'kemco'
      break
    case '80':
      licensee = 'misawa entertainment'
      break
    case '83':
      licensee = 'lozc'
      break
    case '86':
      licensee = '*tokuma shoten i'
      break
    case '8B':
      licensee = 'bullet-proof software'
      break
    case '8C':
      licensee = 'vic tokai'
      break
    case '8E':
      licensee = 'ape'
      break
    case '8F':
      licensee = 'i\'max'
      break
    case '91':
      licensee = 'chun soft'
      break
    case '92':
      licensee = 'video system'
      break
    case '93':
      licensee = 'tsuburava'
      break
    case '95':
      licensee = 'varie'
      break
    case '96':
      licensee = 'yonezawa/s\'pal'
      break
    case '97':
      licensee = 'kaneko'
      break
    case '99':
      licensee = 'arc'
      break
    case '9A':
      licensee = 'nihon bussan'
      break
    case '9B':
      licensee = 'tecmo'
      break
    case '9C':
      licensee = 'imagineer'
      break
    case '9D':
      licensee = 'banpresto'
      break
    case '9F':
      licensee = 'nova'
      break
    case 'A1':
      licensee = 'hori electric'
      break
    case 'A2':
      licensee = 'bandai'
      break
    case 'A4':
      licensee = 'konami'
      break
    case 'A6':
      licensee = 'kawada'
      break
    case 'A7':
      licensee = 'takara'
      break
    case 'A9':
      licensee = 'technos japan'
      break
    case 'AA':
      licensee = 'broderbund'
      break
    case 'AC':
      licensee = 'toei animation'
      break
    case 'AD':
      licensee = 'toho'
      break
    case 'AF':
      licensee = 'namco'
      break
    case 'B0':
      licensee = 'acclaim'
      break
    case 'B1':
      licensee = 'ascii or nexoft'
      break
    case 'B2':
      licensee = 'bandai'
      break
    case 'B4':
      licensee = 'enix'
      break
    case 'B6':
      licensee = 'hal'
      break
    case 'B7':
      licensee = 'snk'
      break
    case 'B9':
      licensee = 'pony canyon'
      break
    case 'BA':
      licensee = '*culture brain o'
      break
    case 'BB':
      licensee = 'sunsoft'
      break
    case 'BD':
      licensee = 'sony imagesoft'
      break
    case 'BF':
      licensee = 'sammy'
      break
    case 'C0':
      licensee = 'taito'
      break
    case 'C2':
      licensee = 'kemco'
      break
    case 'C3':
      licensee = 'squaresoft'
      break
    case 'C4':
      licensee = '*tokuma shoten i'
      break
    case 'C5':
      licensee = 'data east'
      break
    case 'C6':
      licensee = 'tonkin house'
      break
    case 'C8':
      licensee = 'koei'
      break
    case 'C9':
      licensee = 'ufl'
      break
    case 'CA':
      licensee = 'ultra'
      break
    case 'CB':
      licensee = 'vap'
      break
    case 'CC':
      licensee = 'use'
      break
    case 'CD':
      licensee = 'meldac'
      break
    case 'CE':
      licensee = '*pony canyon or'
      break
    case 'CF':
      licensee = 'angel'
      break
    case 'D0':
      licensee = 'taito'
      break
    case 'D1':
      licensee = 'sofel'
      break
    case 'D2':
      licensee = 'quest'
      break
    case 'D3':
      licensee = 'sigma enterprises'
      break
    case 'D4':
      licensee = 'ask kodansha'
      break
    case 'D6':
      licensee = 'naxat soft'
      break
    case 'D7':
      licensee = 'copya systems'
      break
    case 'D9':
      licensee = 'banpresto'
      break
    case 'DA':
      licensee = 'tomy'
      break
    case 'DB':
      licensee = 'ljn'
      break
    case 'DD':
      licensee = 'ncs'
      break
    case 'DE':
      licensee = 'human'
      break
    case 'DF':
      licensee = 'altron'
      break
    case 'E0':
      licensee = 'jaleco'
      break
    case 'E1':
      licensee = 'towachiki'
      break
    case 'E2':
      licensee = 'uutaka'
      break
    case 'E3':
      licensee = 'varie'
      break
    case 'E5':
      licensee = 'epoch'
      break
    case 'E7':
      licensee = 'athena'
      break
    case 'E8':
      licensee = 'asmik'
      break
    case 'E9':
      licensee = 'natsume'
      break
    case 'EA':
      licensee = 'king records'
      break
    case 'EB':
      licensee = 'atlus'
      break
    case 'EC':
      licensee = 'epic/sony records'
      break
    case 'EE':
      licensee = 'igs'
      break
    case 'F0':
      licensee = 'a wave'
      break
    case 'F3':
      licensee = 'extreme entertainment'
      break
    case 'FF':
      licensee = 'ljn'
      break
  }

  return {
    title,
    cartType,
    romSize,
    romSizeBytes,
    ramSize,
    ramSizeBytes,
    japan,
    licensee,
    sgbSupport
  }
}
