#Region ;**** Directives created by AutoIt3Wrapper_GUI ****
#AutoIt3Wrapper_Icon=icon.ico
#AutoIt3Wrapper_UseUpx=y
#EndRegion ;**** Directives created by AutoIt3Wrapper_GUI ****
#include <WindowsConstants.au3>
#include <GUIConstantsEx.au3>
#include <GUIListView.au3>
#include <Date.au3>
#include <File.au3>

Global $sFFExe, $pFFPid
Global $gTitle = "foxSaver by YoloTEAM"

Global $hGMain = GUICreate($gTitle, 650, 410, -1, -1)

Global $idFileMenu = GUICtrlCreateMenu("&File")
Global $idFileMenu_exit = GUICtrlCreateMenuItem("Exit", $idFileMenu)

Global $idFFMenu = GUICtrlCreateMenu("&Firefox")
Global $idFFMenu_defaultProfileOpen = GUICtrlCreateMenuItem("Mở firefox với Profile mặc định", $idFFMenu)
Global $idFFMenu_defaultProfileCreate = GUICtrlCreateMenuItem("Tạo Profile mặc định mới", $idFFMenu)
GUICtrlCreateMenuItem("", $idFFMenu)
Global $idFFMenu_fixFF = GUICtrlCreateMenuItem('Sửa lỗi "firefox.exe đang hoạt động"', $idFFMenu)

Global $idBackupMenu = GUICtrlCreateMenu("&Backup")
Global $idBackupMenu_openFFAfterBackup = GUICtrlCreateMenuItem("Mở firefox với Profile mặc định sau khi tạo Backup", $idBackupMenu)
GUICtrlSetState(-1, $GUI_CHECKED)

Global $hLTotal = GUICtrlCreateLabel("Tổng số backup: -- profile", 15, 25, 200, 15)
GUICtrlSetFont(-1, 9, 400, 0, "Tahoma", 5)

Global $hBFFStart = GUICtrlCreateButton("Start FF", 225, 10, 100, 35)
GUICtrlSetFont(-1, 8.5, 400, 0, "Tahoma", 5)
Global $hBFFExit = GUICtrlCreateButton("Exit FF", 330, 10, 100, 35)
GUICtrlSetFont(-1, 8.5, 400, 0, "Tahoma", 5)
GUICtrlSetState(-1, 128)
Global $hBSave = GUICtrlCreateButton("Tạo Backup", 530, 10, 110, 35)
GUICtrlSetFont(-1, 8.5, 400, 0, "Tahoma", 5)

Global $hLProfiles = GUICtrlCreateListView("stt|Tên|Ngày tạo|Mở gần đây|Số lần đã mở", 0, 60, 650, 350)
_GUICtrlListView_JustifyColumn($hLProfiles, 2, 2)
_GUICtrlListView_JustifyColumn($hLProfiles, 3, 2)
_GUICtrlListView_JustifyColumn($hLProfiles, 4, 2)

GUISetState()

If _foxSaverInit() == -1 Then
	MsgBox(0, "Lỗi 1000", "Firefox chưa được cài đặt. foxSaver sẽ thoát!", 0, $hGMain)
	Exit
EndIf

GUIRegisterMsg($WM_NOTIFY, "WM_NOTIFY")

_loadBackupToListview()

While 1
	Switch GUIGetMsg()
		Case -3
			If MsgBox(4, "Xác nhận", "Bạn chắc chắn muốn thoát?", 0, $hGMain) == 6 Then Exit
		Case $idFileMenu_exit
			If MsgBox(4, "Xác nhận", "Bạn chắc chắn muốn thoát?", 0, $hGMain) == 6 Then Exit
		Case $idFFMenu_defaultProfileCreate
			If MsgBox(4, "Xác nhận", "Bạn chắc chắn muốn tạo Profile mặc định mới?" & @CRLF & @CRLF & _
					"Toàn bộ dữ liệu của Profile mặc định đang có sẽ bị xóa!", 0, $hGMain) == 6 Then _defaultProfile()
		Case $idFFMenu_fixFF
			If MsgBox(4, "Xác nhận", 'Tiến trình "firefox.exe" tắt đột ngột có thể gây mất dữ liệu của Profile' & @CRLF & @CRLF & _
					'Bạn chắc chắn muốn sửa lỗi "firefox.exe đang hoạt động" (Lỗi 1001) ?', 0, $hGMain) == 6 Then _fixFF()
		Case $idFFMenu_defaultProfileOpen
			Run($sFFExe & ' --profile "' & @ScriptDir & '\defaultProfile' & '"')
		Case $idBackupMenu_openFFAfterBackup
			If BitAND(GUICtrlRead($idBackupMenu_openFFAfterBackup), $GUI_CHECKED) = $GUI_CHECKED Then
				GUICtrlSetState($idBackupMenu_openFFAfterBackup, $GUI_UNCHECKED)
			Else
				GUICtrlSetState($idBackupMenu_openFFAfterBackup, $GUI_CHECKED)
			EndIf
		Case $hBFFStart
			_StartFF()
		Case $hBFFExit
			_StopFF()
		Case $hBSave
			GUICtrlSetState($hBSave, 128)
			_createBackup()
			Sleep(1000)
			GUICtrlSetState($hBSave, 64)
	EndSwitch
WEnd

Func _listviewResize()
	_GUICtrlListView_SetColumnWidth($hLProfiles, 0, 50)
	_GUICtrlListView_SetColumnWidth($hLProfiles, 1, 200)
	_GUICtrlListView_SetColumnWidth($hLProfiles, 2, 150)
	_GUICtrlListView_SetColumnWidth($hLProfiles, 3, 150)
	_GUICtrlListView_SetColumnWidth($hLProfiles, 4, 90)
EndFunc   ;==>_listviewResize

; React to double clicks on  ListView
Func WM_NOTIFY($hWnd, $iMsg, $wParam, $lParam)
	Local $tagNMHDR, $event, $hwndFrom
	$tagNMHDR = DllStructCreate("int;int;int", $lParam) ;NMHDR (hwndFrom, idFrom, code)
	If @error Then Return

	Select
		Case $wParam = $hLProfiles
			Select
				Case DllStructGetData($tagNMHDR, 3) = $NM_DBLCLK
					_openBackup()
			EndSelect
	EndSelect

	$tagNMHDR = 0
	$event = 0
	$lParam = 0
EndFunc   ;==>WM_NOTIFY

Func _foxSaverInit()
	Local $sHKLM, $Wow6432Node, $currentVersion
	If @OSArch <> 'X86' Then $Wow6432Node = 'Wow6432Node\'

	$sHKLM = 'HKLM\SOFTWARE\' & $Wow6432Node & 'Mozilla\Mozilla Firefox'

	$currentVersion = RegRead($sHKLM, "CurrentVersion")
	If @error Then
		$sHKLM = 'HKLM64\SOFTWARE\Mozilla\Mozilla Firefox'
		$currentVersion = RegRead($sHKLM, "CurrentVersion")
	EndIf

	$sFFExe = RegRead($sHKLM & "\" & $currentVersion & "\Main", "PathToExe")
	If @error Then
		If FileExists('C:\Program Files\Mozilla Firefox\firefox.exe') Then
			$sFFExe = 'C:\Program Files\Mozilla Firefox\firefox.exe'
			WinSetTitle($hGMain, '', $gTitle & " - FF: unknow")
			Return 1
		EndIf

		_FileWriteLog(@ScriptDir & '\log.txt', "Error reading registry entry for FireFox." & @CRLF & _
				$sHKLM & "\*CurrentVersion*\Main\PathToExe" & @CRLF & _
				"Error from RegRead: " & @error)
		Return -1
	EndIf

	If FileExists($sFFExe) Then
		WinSetTitle($hGMain, '', $gTitle & " - FF: " & RegRead($sHKLM, "CurrentVersion"))
		Return 1
	EndIf

	Return 0
EndFunc   ;==>_foxSaverInit

Func _loadBackupToListview()
	Local $aBackupList = _FileListToArray(@ScriptDir & '\Backup', "*", 2)
	If Not IsArray($aBackupList) Then Return -1
	_GUICtrlListView_DeleteAllItems($hLProfiles)
	GUICtrlSetData($hLTotal, "Tổng số backup: " & $aBackupList[0] & " profile")
	For $i = 1 To $aBackupList[0]
		GUICtrlCreateListViewItem($i & "|" & $aBackupList[$i] & "|" & IniRead(@ScriptDir & '\Backup\' & $aBackupList[$i] & '\info.ini', "foxSaver", "created", "n/a") & "|" & IniRead(@ScriptDir & '\Backup\' & $aBackupList[$i] & '\info.ini', "foxSaver", "last", "n/a") & "|" & IniRead(@ScriptDir & '\Backup\' & $aBackupList[$i] & '\info.ini', "foxSaver", "open", "n/a"), $hLProfiles)
	Next
	_listviewResize()
EndFunc   ;==>_loadBackupToListview

Func _defaultProfile()
	If ProcessExists('firefox.exe') Then Return MsgBox(0, "Lỗi 1001", 'Không thể tạo Profile mặc định khi "firefox.exe" đang hoạt động.', 0, $hGMain)

	DirRemove(@ScriptDir & '\defaultProfile', 1)

	Run($sFFExe & ' --profile "' & @ScriptDir & '\defaultProfile' & '"')
EndFunc   ;==>_defaultProfile

Func _fixFF()
	While ProcessExists('firefox.exe')
		Sleep(50)
		ProcessClose('firefox.exe')
	WEnd

	MsgBox(0, "OK", "Đã sửa xong: Lỗi 1001", 2, $hGMain)
EndFunc   ;==>_fixFF

Func _StartFF()
	If DirGetSize(@ScriptDir & '\currentProfile') <= 0 Then
		If MsgBox(4, "Lỗi 1002", 'Không tìm thấy Profile đang xử dụng.' & @CRLF & @CRLF & 'Nạp Profile mặc định?', 0, $hGMain) == 6 Then
			If DirCopy(@ScriptDir & '\defaultProfile', @ScriptDir & '\currentProfile', 1) Then MsgBox(0, "OK", "Nạp thành công Profile mặc định", 2, $hGMain)
		EndIf

		Return -1
	EndIf

	$pFFPid = Run($sFFExe & ' --profile "' & @ScriptDir & '\currentProfile' & '"')
	ConsoleWrite($pFFPid &@CRLF)

	If ProcessExists($pFFPid) Then
		GUICtrlSetState($hBFFExit, 64)
		GUICtrlSetState($hBFFStart, 128)
		Return 1
	EndIf

	Return 0
EndFunc   ;==>_StartFF

Func _StopFF()
	If ProcessClose($pFFPid) Or Not ProcessExists($pFFPid) Then
		GUICtrlSetState($hBFFExit, 128)
		GUICtrlSetState($hBFFStart, 64)

		Return 1
	EndIf

	Return 0
EndFunc   ;==>_StopFF

Func _createBackup()
	Local $timer = TimerInit()
	DirCopy(@ScriptDir & '\currentProfile', @ScriptDir & '\Backup\backup_' & $timer, 1)
	IniWrite(@ScriptDir & '\Backup\backup_' & $timer & '\info.ini', "foxSaver", "created", _Now())

	If _StopFF() Then DirCopy(@ScriptDir & '\defaultProfile', @ScriptDir & '\currentProfile', 1)
	If BitAND(GUICtrlRead($idBackupMenu_openFFAfterBackup), $GUI_CHECKED) = $GUI_CHECKED Then _StartFF()
	_loadBackupToListview()
EndFunc   ;==>_createBackup

Func _openBackup()
	If ProcessExists('firefox.exe') Then Return MsgBox(0, "Lỗi 1001", 'Không thể tạo Profile mặc định khi "firefox.exe" đang hoạt động.', 0, $hGMain)

	Local $item = _GUICtrlListView_GetItemTextArray($hLProfiles, Number(_GUICtrlListView_GetSelectedIndices($hLProfiles)))
	If Not IsArray($item) Then Return

	Local $lastTime = _Now()
	Local $open = Int($item[5]) + 1

	IniWrite(@ScriptDir & '\Backup\' & $item[2] & '\info.ini', "foxSaver", "last", $lastTime)

	IniWrite(@ScriptDir & '\Backup\' & $item[2] & '\info.ini', "foxSaver", "open", $open)

	_GUICtrlListView_SetItemText($hLProfiles, Number(_GUICtrlListView_GetSelectedIndices($hLProfiles)), $lastTime, 3)

	_GUICtrlListView_SetItemText($hLProfiles, Number(_GUICtrlListView_GetSelectedIndices($hLProfiles)), $open, 4)

	$pFFPid = Run($sFFExe & ' --profile "' & @ScriptDir & '\Backup\' & $item[2] & '"')
EndFunc   ;==>_openBackup
