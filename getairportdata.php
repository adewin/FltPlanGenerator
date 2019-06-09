<?php
	$long = filter_input(INPUT_POST, "long");
	$lat = filter_input(INPUT_POST, "lat");
	$db_handle = new SQLite3("waypoints.db");
	$result = $db_handle -> query("SELECT * from Airports WHERE long LIKE ".round($long,2)."% AND lat LIKE ".round($lat,2)."%");
	$response = array();
	while($row=$result->fetchArray()) {
		$response[] = $row;
	}
	echo json_encode($response);
?>