-- phpMyAdmin SQL Dump
-- version 5.2.0
-- https://www.phpmyadmin.net/
--
-- Host: mariadb
-- Erstellungszeit: 30. Dez 2022 um 08:12
-- Server-Version: 10.9.4-MariaDB-1:10.9.4+maria~ubu2204
-- PHP-Version: 8.0.26

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Datenbank: `serienabend`
--

-- --------------------------------------------------------

--
-- Tabellenstruktur für Tabelle `Chef`
--

CREATE TABLE `Chef` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `points` int(11) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Tabellenstruktur für Tabelle `History`
--

CREATE TABLE `History` (
  `id` int(11) NOT NULL,
  `date` datetime NOT NULL,
  `numberOfPersons` int(11) NOT NULL,
  `chefId` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Tabellenstruktur für Tabelle `Setting`
--

CREATE TABLE `Setting` (
  `settingsKey` varchar(255) NOT NULL,
  `settingsValue` longtext DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Indizes der exportierten Tabellen
--

--
-- Indizes für die Tabelle `Chef`
--
ALTER TABLE `Chef`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `name` (`name`);

--
-- Indizes für die Tabelle `History`
--
ALTER TABLE `History`
  ADD PRIMARY KEY (`id`),
  ADD KEY `history_ibfk_chef_id` (`chefId`);

--
-- Indizes für die Tabelle `Setting`
--
ALTER TABLE `Setting`
  ADD PRIMARY KEY (`settingsKey`);

--
-- AUTO_INCREMENT für exportierte Tabellen
--

--
-- AUTO_INCREMENT für Tabelle `Chef`
--
ALTER TABLE `Chef`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT für Tabelle `History`
--
ALTER TABLE `History`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- Constraints der exportierten Tabellen
--

--
-- Constraints der Tabelle `History`
--
ALTER TABLE `History`
  ADD CONSTRAINT `History_ibfk_chef_id` FOREIGN KEY (`chefId`) REFERENCES `Chef` (`id`) ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
