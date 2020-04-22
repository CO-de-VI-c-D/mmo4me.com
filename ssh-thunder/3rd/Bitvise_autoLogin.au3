#include-once
#include <String.au3>

; Config-section
Global $BvSsh_path = @ScriptDir & "\Bitvise" ; path to Bitvise
Global $BvSsh_listenInterface = "0.0.0.0" ; or 127.0.0.1
Global $BvSsh_listenPort = 1080 ; or 8080
Global $BvSsh_timeOut = 10 ; or 30 (seconds)
Global $BvSsh_hideAll = False ; True/False - Hide All Bitvise GUI
Global $BvSsh_pID

If _BvSsh_Login('65.111.168.104', 'john', 'password') Then
	MsgBox(0, 'OK', 'Connection Successfully!')
Else
	MsgBox(0, 'Error', 'Connection Error!')
EndIf

Func _BvSsh_Login($host, $user, $pass)
	ProcessClose($BvSsh_pID)
	Sleep(1000)

	Local $BvSsh_profile = _HexToString('0000000E54756E6E656C69657220342E3532000000000000001600000000000000000000000000000000000000000000000B627364617574682C7' & _
			'0616D01010001020000000200000000000005787465726D010000FDE900000050000000190000012C07010000000000000000000D3132372E302E302E313A302E3000000000000000' & _
			'0000000000000000093132372E302E302E3100000D3D00000000000000000000000000000000010000000101010101010101000001010101000001010101000000012C01000000000' & _
			'0000000000001' & _ipToHex($BvSsh_listenInterface) & '0000000' & StringLen($BvSsh_listenPort) & _StringToHex($BvSsh_listenPort) & '000000000000000' & _
			'000007F00000100000002323100000000010101000000000000000000000000000000010100000001010000000000000000000000000000000000000200')

	RegWrite("HKEY_CURRENT_USER\Software\Bitvise" & $BvSsh_listenPort & "\BvSshClient", 'DefaultProfile', 'REG_BINARY', $BvSsh_profile)

	_BvSsh_runCmd($host, $user, $pass, $BvSsh_listenPort)

	Return _BvSsh_waitConnected($BvSsh_listenPort, $BvSsh_timeOut * 1000)
EndFunc   ;==>_BvSsh_Login

Func _BvSsh_runCmd($iHost, $iUser, $iPass, $iPort)
	Local $Cmd = $BvSsh_path & "\BvSsh.exe -host=" & $iHost & " -port=22 -user=" & $iUser & " -password=" & $iPass & _
			" -loginOnStartup -exitOnLogout -baseRegistry=HKEY_CURRENT_USER\Software\Bitvise" & $iPort

	If $BvSsh_hideAll Then
		$Cmd &= " -menu=small -hide=popups,trayLog,trayPopups,trayIcon"
	EndIf

	$BvSsh_pID = Run($Cmd)
	ProcessWait($BvSsh_pID)

	Sleep(1500)
EndFunc   ;==>_BvSsh_runCmd

Func _BvSsh_waitConnected($port, $time_out = 10000, $delay = 80)
	Local $timer_int = TimerInit()
	While TimerDiff($timer_int) < $time_out
		If Not ProcessExists($BvSsh_pID) Then ExitLoop
		If _BvSsh_checkConnection($port) Then Return TimerDiff($timer_int)
		Sleep($delay)
	WEnd

	Return 0
EndFunc   ;==>_BvSsh_waitConnected

Func _BvSsh_checkConnection($port)
	TCPStartup()
	Local $connection = TCPConnect("127.0.0.1", $port)
	If $connection <> -1 Then
		TCPCloseSocket($connection)
		TCPShutdown()
		Return 1
	Else
		TCPShutdown()
		Return 0
	EndIf
EndFunc   ;==>_BvSsh_checkConnection

Func _ipToHex($ip)
	Local $ipSplit = StringSplit($ip, ".")
	If UBound($ipSplit) < 4 Then Return 0
	Return Hex($ipSplit[1], 2) & Hex($ipSplit[2], 2) & Hex($ipSplit[3], 2) & Hex($ipSplit[4], 2)
EndFunc   ;==>_ipToHex
