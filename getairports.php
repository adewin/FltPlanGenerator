<?php
	$db_handle = new SQLite3("waypoints.db");
	$result = $db_handle -> query("SELECT * FROM Airports");
	$response = array();
	while($row=$result->fetchArray()) {
		$response[] = $row;
	}
	echo json_encode($response);
?>