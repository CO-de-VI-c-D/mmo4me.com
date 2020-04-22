#Region ;**** Directives created by AutoIt3Wrapper_GUI ****
#AutoIt3Wrapper_UseUpx=n
#EndRegion ;**** Directives created by AutoIt3Wrapper_GUI ****
#NoTrayIcon
#include-once
#include <String.au3>

If $CmdLine[0] < 1 Then Exit

; Config-section
Local $BvSsh_listenInterface = $CmdLine[0] > 1 ? $CmdLine[2] : "0.0.0.0"
Local $BvSsh_listenPort = $CmdLine[1]

Local $BvSsh_profile = _HexToString('0000000E54756E6E656C69657220342E3532000000000000001600000000000000000000000000000000000000000000000B627364617574682C7' & _
		'0616D01010001020000000200000000000005787465726D010000C3BDC3A900000050000000190000012C07010000000000000000000D3132372E302E302E313A302E300000000000' & _
		'00000000000000000000093132372E302E302E3100000D3D00000000000000000000000000000000010000000101010101010101000001010101000001010101000000012C0100000' & _
		'00000000000000001' & _ipToHex($BvSsh_listenInterface) & '0000000' & StringLen($BvSsh_listenPort) & _StringToHex($BvSsh_listenPort) & '00000000000' & _
		'0000000007F00000100000002323100000000010101000000000000000000000000000000010100000001010000000000000000000000000000000000000200')

RegWrite("HKEY_CURRENT_USER\Software\SshThunder\Bitvise\" & $BvSsh_listenPort & "\BvSshClient\", 'DefaultProfile', 'REG_BINARY', $BvSsh_profile)

Func _ipToHex($ip)
	Local $ipSplit = StringSplit($ip, ".")
	If UBound($ipSplit) < 4 Then Return 0
	Return Hex($ipSplit[1], 2) & Hex($ipSplit[2], 2) & Hex($ipSplit[3], 2) & Hex($ipSplit[4], 2)
EndFunc   ;==>_ipToHex
