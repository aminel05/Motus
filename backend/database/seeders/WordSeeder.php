<?php

namespace Database\Seeders;

use App\Models\Word;
use Illuminate\Database\Seeder;

class WordSeeder extends Seeder
{
    public function run(): void
    {
        $words = [
            'MAISON', 'CHIEN', 'TABLE', 'LIVRE', 'FLEUR', 'JOURN', 'PLACE', 'PORTE', 'SALON',
            'ROUTE', 'TERRE', 'MER', 'FORET', 'TEMPS', 'CHAUD', 'FROID',
            'BLANC', 'NOIRE', 'VERTE', 'GRISE', 'ROUGE', 'JAUNE', 'BLEUE', 'ROSES', 'ARBRE', 'HERBE',
            'SABLE', 'PIERR', 'MUR', 'PONTS', 'BAINS', 'PLAGE', 'COEUR', 'AMOUR', 'ECOLE', 'CLASSE',
            'ELEVE', 'NOTES', 'PAGES', 'MOTUS', 'JEUDI', 'VENDI', 'LUNDI', 'MARDI', 'MERCR',
            'SAMEI', 'NUITS', 'MATIN', 'SOIRS', 'HEURE', 'MINUT', 'SECON', 'FEMME', 'HOMME', 'ENFAN',
            'AIMERA', 'BEAUTE', 'BOUGEO', 'CAMPAG', 'DANSE', 'ENNEMI', 'FRERES', 'GRAIN', 'HIVER', 'IDOLE',
            'JAMBE', 'KOALA', 'LANGUE', 'MAGIE', 'NEFLE', 'OEUFS', 'PLUMES', 'QUART', 'RIRE', 'SOURI',
            'TOMBE', 'UNION', 'VAGUE', 'WAGON', 'YOGA', 'ZEBRE', 'ABEILL', 'BIBLIO', 'COFFRE', 'DIAMAN',
            'ETOILE', 'FROMAG', 'GLACES', 'HOTEL', 'JAMBON', 'KIOSQU', 'LITTER', 'MONTRE', 'NUANCE',
            'OISEAU', 'PARENT', 'QUILLE', 'RAISON', 'SIECLE', 'TRADUI', 'USAGES', 'VILLES', 'WEBCAM', 'XYLOPH',
            'YEUX', 'ZINCS', 'ABRICOT', 'ADRESSE', 'ALLUMET', 'AMANDE', 'AQUARIU', 'ARTICHA', 'ASSAISO',
            'AUDITIO', 'AUTEUR', 'AVOCATS', 'BAGUETT', 'BALLADE', 'BANQUET', 'BARBECU', 'BAROMET', 'BATIMEN', 'BEAUTIF',
            'BERGERI', 'BICYCLET', 'BILLETT', 'BLOCAGE', 'BOISSON', 'BONHEUR', 'BOUCHER', 'BOUTIQU', 'BROCOLI', 'BROCHET',
            'ABONDANCE', 'ABSOLUME', 'ACADEMIE', 'ACCIDENT', 'ACCUEILL', 'ACHETEUR', 'ACTIVITE', 'AEROPORT', 'AFFAIRES',
            'ALGORITHM', 'ALLIANCE', 'AMBIANCE', 'AMERICAIN', 'AMITIE', 'ANALYSE', 'APPAREIL', 'APPORTER',
            'ARMURIER', 'ARRIVAGE', 'ARTICLES', 'ATELIER', 'AUTOMNE', 'AVENIR',
            'BAGUETTE', 'BATAILLE', 'BATIMENT', 'BIENVENU', 'BOISSONS', 'BOUCHERS',
            'BRASSERI', 'BULLETIN', 'BUREAU', 'CABARET', 'CALCULER', 'CAMARADE', 'CAMION', 'CANAPES',
            'CAPITALE', 'CARTABLE', 'CASCADE', 'CAUTION', 'CELEBRE', 'CENTAINE', 'CERISIER',
            'CHAMPION', 'CHANCEUX', 'CHANGER', 'CHANSON', 'CHAOS', 'CHAPITRE', 'CHARGER', 'CHARMANT',
            'IMAGINAIRE', 'ALGORITHME', 'CONSCIENCE', 'EXPERIENCE', 'DIFFERENCE', 'EXCELLENCE',
            'INDIVIDUEL', 'GENERATION', 'POPULATION', 'CELEBRITES', 'IMPORTANCE', 'RESISTANCE',
            'ACCEPTERAI', 'EXPRESSION', 'GOUVERNEUR', 'MAINTENANT', 'ADAPTATION',
            'FAMILLE', 'JUSTICE', 'HABITUDE', 'REUSSITE', 'SOUVENIR', 'TERRIBLE', 'ZODIAQUE',
            'COMPARERA', 'DEMANDEUR', 'EVOLUTION', 'LIBERTIES', 'NAISSANCE', 'OPERATION',
            'QUOTIDIEN', 'ULTIMATUM', 'VERITABLE', 'WATERLOOS', 'XYLOPHONE',
        ];

        $map = [
            5 => 'easy',
            7 => 'medium',
            10 => 'hard',
        ];

        $inserted = 0;
        $skipped = 0;
        $byBucket = ['easy' => 0, 'medium' => 0, 'hard' => 0];

        foreach ($words as $word) {
            $length = mb_strlen($word);

            if (! isset($map[$length])) {
                $skipped++;
                continue;
            }

            $difficulty = $map[$length];

            Word::updateOrCreate(
                ['word' => $word],
                [
                    'length' => $length,
                    'difficulty' => $difficulty,
                ],
            );
            $inserted++;
            $byBucket[$difficulty]++;
        }

        $this->command?->info("WordSeeder: inserted/updated {$inserted} words ({$byBucket['easy']} easy, {$byBucket['medium']} medium, {$byBucket['hard']} hard), skipped {$skipped} (wrong length).");
    }
}
