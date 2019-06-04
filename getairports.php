<?php
	$db_handle = new SQLite3("waypoints.db");
	$result = $db_handle -> query("SELECT long, lat FROM Airports");
	$response = array();
	while($row=$result->fetchArray()) {
		$response[] = $row;
	}
	echo json_encode($response);
?>